const net = require('net');

const constants = require('./string-resources');
const ItemFormat = require('../messages/data/item-format');

const {
	InvalidEnumValueError,
	InvalidFormatError,
	InvalidItemSizeError } = require('./errors/custom-errors')

//https://webbjocke.com/javascript-check-data-types/
class ValidationHelper {

	static getByteInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, constants.MIN_BYTE, constants.MAX_BYTE, name);
	}

	static getUByteInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, 0, constants.MAX_UBYTE, name);
	}

	static getShortInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, constants.MIN_SHORT, constants.MAX_SHORT, name);
	}

	static getUShortInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, 0, constants.MAX_USHORT, name);
	}

	static getIntInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, constants.MIN_INT, constants.MAX_INT, name);
	}

	static getUIntInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, 0, constants.MAX_UINT, name);
	}

	static getLongInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, constants.MIN_LONG, constants.MAX_LONG, name);
	}

	static getULongInRange(v, name) {
		return ValidationHelper.getNumberInRange(v, 0, constants.MAX_ULONG, name);
	}

	static getNumberInRange(v, low, up, name) {
		let nv = parseInt(v);
		if (!isNaN(nv) && nv >= low && nv <= up) {
			return nv;
		} else {
			throw new TypeError(constants.getErrNumberNotInRange(name, low, up));
		}
	}

	static isString(s) {
		return (typeof s === 'string' || s instanceof String);
	}

	static isNumber(n) {
		return (typeof n === 'number' || n instanceof Number);
	}

	static isFunction(c) {
		return (typeof c === 'function' || c instanceof Function );
	}

	static isBoolean(b) {
		return (typeof b === 'boolean' || b instanceof Boolean );
	}

	static isBuffer(b) {
		return (typeof b === 'buffer' || b instanceof Buffer );
	}

	static isUndefined(f) {
		return typeof f === "undefined"
	}

	static isIP(ip) {
		return (0 !== net.isIP(ip));
	}

	static getEnumValue(enumType, f) {
		if (!enumType || ValidationHelper.isUndefined(f)) {
			throw new InvalidEnumValueError();
		}

		if (ValidationHelper.isString(f) && Object.prototype.hasOwnProperty.call( enumType, f)) {
			f = enumType[f];
		}

		if (!(Number.isInteger(f) && Object.values(enumType).indexOf(f) > -1)) {
			throw new InvalidEnumValueError();
		}

		return f;
	}

	static getItemValue(value, format, size) {
		if (ValidationHelper.isUndefined(value) || ValidationHelper.isUndefined(format)) {
			throw new InvalidFormatError();
		}

		format = ValidationHelper.getEnumValue(ItemFormat, format);
		let res;

		if (ItemFormat.isInteger(format)) {
			let piv = parseInt(value);
			if (!isNaN(piv)) {
				res = piv;
			}

			if (typeof value == "boolean") {
				res = value ? 1 : 0;
			}
		}

		if (ItemFormat.isFloat(format)) {
			let pfv = parseFloat(value);
			if (!isNaN(pfv) && isFinite(value)) {
				res = pfv;
			}
		}

		try {
			switch (format) {
				case ItemFormat.Bin:
					if (ValidationHelper.isUndefined(size) || !Number.isInteger(size)) {
						throw new InvalidItemSizeError();
					}

					if (ValidationHelper.isString(value)) {
						res = Buffer.from(value, 'utf-8');
					}

					if (ValidationHelper.isNumber(value)) {
						const psv = parseInt(value);
						let buff_array = [];
						let val = 0;
						if (!isNaN(psv) && isFinite(psv)) {
							for(let i = 0; i < size; i++) {
								val = (psv >> (i * 8)) & 0xFF
								buff_array.push(val);
							}
							res = Buffer.from(buff_array);
						}
					}

					if (ValidationHelper.isBuffer(value)) {
						res = value
					}

					if (value == null) {
						res = Buffer.from([])
					}

					if(res.length < size) {
						let addBuff = [];
						for(var i = 0; i < (size - res.length); i++) {
							addBuff.push(0)
						}
						res = Buffer.concat([res, Buffer.from(addBuff)])
					}

					res = res.slice(0, size)
					break;

				case ItemFormat.Bool:
					res = value ? true : false; // ?? 
					break;

				case ItemFormat.I1:
					res = ValidationHelper.getByteInRange(res);
					break;

				case ItemFormat.I2:
					res = ValidationHelper.getShortInRange(res);
					break;

				case ItemFormat.I4:
					res = ValidationHelper.getIntInRange(res);
					break;

				case ItemFormat.I8:
					res = ValidationHelper.getLongInRange(res);
					break;

				case ItemFormat.U1:
					res = ValidationHelper.getUByteInRange(res);
					break;

				case ItemFormat.U2:
					res = ValidationHelper.getUShortInRange(res);
					break;

				case ItemFormat.U4:
					res = ValidationHelper.getUIntInRange(res);
					break;

				case ItemFormat.U8:
					res = ValidationHelper.getULongInRange(res);
					break;
	

				case ItemFormat.A: {
					if (ValidationHelper.isUndefined(size) || !Number.isInteger(size)) {
						throw new InvalidItemSizeError();
					}

					if (ValidationHelper.isString(value)) {
						res = value;
					}

					if (ValidationHelper.isNumber(value)) {
						const psv = parseFloat(value);
	
						if (!isNaN(psv) && isFinite(psv)) {
							res = psv.toString();
						}
					}

					if (!value) {
						res = '';
					}

					res = res.substring(0, size).padEnd(size, ' ');
					break;
				}
			}
		}
		catch (e) {
			if (e instanceof InvalidItemSizeError) {
				throw (e);
			}

			res = undefined;
		}

		if (ValidationHelper.isUndefined(res)) {
			throw new InvalidFormatError();
		}

		return res;
	}

	static flatten(arr) {
		// Only NodeJS version 11 and above support native flat method. 
		// That's why I am using my own.
		return arr.reduce(function (flat, toFlatten) {
			return flat.concat(Array.isArray(toFlatten) ? ValidationHelper.flatten(toFlatten) : toFlatten);
		}, []);
	}




}

module.exports = ValidationHelper;