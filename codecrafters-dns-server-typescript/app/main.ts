import * as dgram from "dgram";
import { Message } from "./header";

function composeHeader(message: Message) {
	const headerBuffer = Buffer.alloc(12);
	headerBuffer.writeUInt16BE(message.header.ID);
	headerBuffer.writeUInt8(
		Number(
			`0b${message.header.QR}${message.header.OpCode}${message.header.AA}${message.header.TC}${message.header.RD}`
		),
		2
	);
	headerBuffer.writeUInt8(
		Number(`0b${message.header.RA}${message.header.Z}${message.header.RCode}`),
		3
	);
	headerBuffer.writeUInt16BE(message.header.QDCOUNT, 4);
	headerBuffer.writeUInt16BE(message.header.ANCOUNT, 6);
	headerBuffer.writeUInt16BE(message.header.NSCOUNT, 8);
	headerBuffer.writeUInt16BE(message.header.ARCOUNT, 10);
	return headerBuffer;
}
function composeQuestions(message: Message) {
	const questionLabels = message.question.name.split(".").map((label) => {
		const length = label.length;
		const buff = Buffer.alloc(length + 1);
		buff.writeUInt8(length);
		buff.write(label, 1);
		return buff;
	});
	const endBuffer = Buffer.alloc(1);
	endBuffer.writeUInt8(0);
	const dnsTypeBuffer = Buffer.alloc(2);
	dnsTypeBuffer.writeUInt16BE(message.question.type);
	const dnsClassBuffer = Buffer.alloc(2);
	dnsClassBuffer.writeUInt16BE(message.question.class);
	return Buffer.concat([
		...questionLabels,
		endBuffer,
		dnsTypeBuffer,
		dnsClassBuffer,
	]);
}
function composeAnswers(message: Message) {
	const questionLabels = message.answer.name.split(".").map((label) => {
		const length = label.length;
		const buff = Buffer.alloc(length + 1);
		buff.writeUInt8(length);
		buff.write(label, 1);
		return buff;
	});
	const endBuffer = Buffer.alloc(1);
	endBuffer.writeUInt8(0);
	const dnsTypeBuffer = Buffer.alloc(2);
	dnsTypeBuffer.writeUInt16BE(message.question.type);
	const dnsClassBuffer = Buffer.alloc(2);
	dnsClassBuffer.writeUInt16BE(message.question.class);
	const ttlBuffer = Buffer.alloc(4);
	ttlBuffer.writeUInt32BE(message.answer.TTL);
	const lengthBuffer = Buffer.alloc(2);
	lengthBuffer.writeUInt16BE(message.answer.length);
	const dataLabels = message.answer.data.split(".").map((label) => {
		const buff = Buffer.alloc(1);
		buff.writeUInt8(Number(label));
		return buff;
	});
	return Buffer.concat([
		...questionLabels,
		endBuffer,
		dnsTypeBuffer,
		dnsClassBuffer,
		ttlBuffer,
		lengthBuffer,
		...dataLabels,
	]);
}

const bufferFromMessage = (message: Message): Buffer => {
	const headerBuffer = composeHeader(message);
	const questionsBuffer = composeQuestions(message);
	const questionsAnswers = composeAnswers(message);
	return Buffer.concat([headerBuffer, questionsBuffer, questionsAnswers]);
};

console.log("Logs from your program will appear here!");

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
	try {
		console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

		const responseMessage: Message = {
			// now i need the request id and parse it into the response id
			// i need to parse the request id from the data buffer

			header: {
				ID: buffer.readUInt16BE(0),
				QR: (buffer.readUInt16BE(2) >> 15) & 0b1,
				OPCODE: (buffer.readUInt16BE(2) >> 11) & 0b1111,
				AA: (buffer.readUInt16BE(2) >> 10) & 0b1,
				TC: (buffer.readUInt16BE(2) >> 9) & 0b1,
				RD: (buffer.readUInt16BE(2) >> 8) & 0b1,
				RA: (buffer.readUInt16BE(2) >> 7) & 0b1,
				Z: 0,
				RCODE: buffer.readUInt16BE(2) & 0b1111,
				QDCOUNT: buffer.readUInt16BE(4),
				ANCOUNT: buffer.readUInt16BE(6),
				NSCOUNT: buffer.readUInt16BE(8),
				ARCOUNT: buffer.readUInt16BE(10),
			},
			question: {
				name: "codecrafters.io",
				type: 1,
				class: 1,
			},
			answer: {
				name: "codecrafters.io",
				type: 1,
				class: 1,
				TTL: 60,
				length: 4,
				data: "8.8.8.8",
			},
		};

		const responseBuffer = bufferFromMessage(responseMessage);
		console.log(`Response buffer ${responseBuffer.toString()}`);
		udpSocket.send(responseBuffer, remoteAddr.port, remoteAddr.address);
	} catch (e) {
		console.log(`Error sending data: ${e}`);
	}
});
