type Bit = 0 | 1;

type Header = {
	ID: number;
	QR: Bit;
	OpCode: string;
	AA: Bit;
	TC: Bit;
	RD: Bit;
	RA: Bit;
	Z: string;
	RCode: string;
	QDCOUNT: number;
	ANCOUNT: number;
	NSCOUNT: number;
	ARCOUNT: number;
};

type Question = {
	name: string;
	type: number;
	class: number;
};

type Answer = {
	name: string;
	type: number;
	class: number;
	TTL: number;
	length: number;
	data: string;
};

export type Message = {
	header: Header;
	question: Question;
	answer: Answer;
};
