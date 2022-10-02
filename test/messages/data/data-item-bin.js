var assert = require('assert');
var expect = require('chai').expect;
var should = require('chai').should();

const {
	DataItem,
	ItemFormat,
	Constants,
	Decoder,
	Encoder } = require('../../../src/hsms')

const {
	NoBuilderError,
	TooManyParamsError,
	InvalidEnumValueError,
	InvalidFormatError } = require('../../../src/utils/errors/custom-errors')

describe('Data Item Bin', () => {

	it('should be created with a correct value', () => {
		let buf = Buffer.from([0x01, 0x02])
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.size(2)
			.value(buf)
			.build();

		item.should.have.property('size').equal(2);
		Buffer.compare(item.value, Buffer.from([1, 2])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value via shortcut', () => {
		let buf = Buffer.from([0x01, 0x02]);
		const item = DataItem.bin('', buf, 2);

		item.should.have.property('size').equal(2);
		Buffer.compare(item.value, Buffer.from([1, 2])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (set as buffer)', () => {
		let buf = Buffer.from([0x01, 0x02, 0x03]);
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.size(3)
			.value(buf)
			.build();

		item.should.have.property('name').equal('');
		item.should.have.property('size').equal(3);
		Buffer.compare(item.value, Buffer.from([1, 2, 3])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value via shortcut (set as number)', () => {
		const item = DataItem.bin('age', 123, 1);

		item.should.have.property('name').equal('age');
		item.should.have.property('size').equal(1);
		item.should.have.property('value');
		Buffer.compare(item.value, Buffer.from([123])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (empty buffer)', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.size(10)
			//.value( "" )
			.build();

		item.should.have.property('size').equal(10);
		Buffer.compare(item.value, Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (empty buffer and zero size)', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			//.size( 5 )
			//.value( "This is a very long message" )
			.build();

		item.should.have.property('size').equal(0);
		Buffer.compare(item.value, Buffer.from([])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (non-empty input buffer and zero size)', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			//.size( 5 )
			.value(Buffer.from([1, 2, 3, 4, 5]))
			.build();

		item.should.have.property('size').equal(0);
		Buffer.compare(item.value, Buffer.from([])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (empty input string and zero size via shortcut)', () => {
		const item = DataItem.bin("proc", null);

		item.should.have.property('size').equal(0);
		Buffer.compare(item.value, Buffer.from([])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (mix setting size&value order) #1', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.value(Buffer.from([1, 2, 3, 4, 5]))
			.size(3)
			.build();

		item.should.have.property('size').equal(3);
		Buffer.compare(item.value, Buffer.from([0, 0, 0])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (mix setting size&value order) #2', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.value(Buffer.from([11, 22, 33, 44, 55]))
			.size(3)
			.value(Buffer.from([1, 2, 3, 4, 5]))
			.build();

		item.should.have.property('size').equal(3);
		Buffer.compare(item.value, Buffer.from([1, 2, 3])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (mix setting size&value order) #3', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.value(Buffer.from([11, 22, 33, 44, 55]))
			.size(3)
			.value(Buffer.from([1, 2, 3, 4, 5]))
			.size(5)
			.build();

		item.should.have.property('size').equal(5);
		Buffer.compare(item.value, Buffer.from([1, 2, 3, 0, 0])).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (single element array)', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.size(5)
			.value(["test"])
			.build();

		item.should.have.property('size').equal(5);
		Buffer.compare(item.value, Buffer.from("test\0")).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (multiple elements array)', () => {
		const item = DataItem
			.builder
			.format(ItemFormat.Bin)
			.size(5)
			.value(["test", 11, () => 8])
			.build();

		item.should.have.property('size').equal(5);
		Buffer.compare(item.value, Buffer.from("test\0")).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (single element array via static method)', () => {
		const item = DataItem.bin("", ["test"], 5)

		item.should.have.property('name').equal('');
		item.should.have.property('size').equal(5);
		Buffer.compare(item.value, Buffer.from("test\0")).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should be created with a correct value (multiple elements array via static method)', () => {
		const item = DataItem.bin("temp", ["test", "ad"], 3)

		item.should.have.property('name').equal('temp');
		item.should.have.property('size').equal(3);
		Buffer.compare(item.value, Buffer.from("tes")).should.equal(0);
		item.should.have.property('format').equal(ItemFormat.Bin);
	});

	it('should throw an exception if passing an invalid value (object)', () => {
		expect(() => {
			DataItem
				.builder
				.format(ItemFormat.Bin)
				.size(12)
				.value({ name: "error" })
				.build();
		})
			.to.throw(InvalidFormatError);
	});


	it('should throw an exception if passing an invalid value (single value array with undefined)', () => {
		expect(() => {
			DataItem
				.builder
				.format(ItemFormat.Bin)
				.size(5)
				.value([undefined])
				.build();
		})
			.to.throw(InvalidFormatError);
	});

	it('should throw an exception if passing invalid value before setting a format', () => {
		expect(() => {
			DataItem
				.builder
				.value("long string")
				.format(ItemFormat.Bin)
				.build();
		})
			.to.throw(InvalidFormatError);
	});

	it('encode must return valid binary stream #1', () => {
		const m = DataItem.bin("temp", "hello world !", 10);

		const encodedArray = Encoder.encode(m);
		const expectedArray = Buffer.from([0x21, 0x0A, 0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x77, 0x6F, 0x72, 0x6C])

		expect(Buffer.compare(encodedArray, expectedArray)).equal(0);
	});

	it('encode must return valid binary stream #2', () => {
		const m = DataItem.bin("temp", "", 5);

		const encodedArray = Encoder.encode(m);
		const expectedArray = Buffer.from([0x21, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00])

		expect(Buffer.compare(encodedArray, expectedArray)).equal(0);
	});


	it('encode must return valid binary stream #3', () => {
		const m = DataItem.bin("temp", "start", 15);

		const encodedArray = Encoder.encode(m);
		const expectedArray = Buffer.from([0x21, 0x0F, 0x73, 0x74, 0x61, 0x72, 0x74,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])

		expect(Buffer.compare(encodedArray, expectedArray)).equal(0);
	});

	it('decode must return valid DataItem #1', () => {
		const incomingBuffer = Buffer.from([0x00, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x21, 0x03, 0x01, 0x02, 0x03])
		const item = Decoder.decode(incomingBuffer)
		expect(item.items.length).equal(1);
		expect(item.items[0].format).equal(ItemFormat.Bin);
		expect(item.items[0].size).equal(3);
		Buffer.compare(item.items[0].value, Buffer.from([0x01, 0x02, 0x03])).should.equal(0);
	});

	it('should return string representation using toString()', () => {
		const item = DataItem.bin('', Buffer.from([0x01, 0x02]), 2);
		const item_str = item.toString();

		expect(item_str).equal("Bin<2>  [1,2]");
	});

});