module.exports = (function () {

	/**
	 * Represents available item formats where every value containts format code.
	*/
	const ItemFormat = Object.freeze({
		List: 0, // List(length in elements)
		Bin: 32, // Binary
		Bool: 36,// Boolean
		A: 64,   // ASCII
		I8: 96,  // 8 byte integer (signed)
		I4: 112, // 4 byte integer (signed)
		I2: 104, // 2 byte integer (signed)
		I1: 100, // 1 byte integer (signed)
		F8: 128, // 8 byte floating point
		F4: 144, // 5 byte floating point
		U8: 160, // 8 byte integer
		U4: 176, // 4 byte integer
		U2: 168, // 2 byte integer
		U1: 164, // 1 byte integer

		isSizeable(n) {
			switch (n) {
				case this.Bin:
				case this.A:
					return true;

				default:
					return false;
			}
		},

		isString(n) {
			switch (n) {
				case this.A:
					return true;

				default:
					return false;
			}
		},

		isInteger(n) {
			switch (n) {
				case ItemFormat.I1:
				case ItemFormat.I2:
				case ItemFormat.I4:
				case ItemFormat.I8:
				case ItemFormat.U1:
				case ItemFormat.U2:
				case ItemFormat.U4:
				case ItemFormat.U8:
					return true;

				default:
					return false;
			}
		},


		isFloat(n) {
			switch (n) {
				case ItemFormat.F4:
				case ItemFormat.F8:
					return true;

				default:
					return false;
			}
		},

		isBoolean(n) {
			switch (n) {
				case ItemFormat.Bool:
					return true;

				default:
					return false;
			}
		},

		isBinary(n) {
			switch (n) {
				case ItemFormat.Bin:
					return true;
				
				default:
					return false;
			}
		},

		default(n, size = 0) {
			if (this.isInteger(n) || this.isFloat(n)) {
				return 0;
			}

			if (this.isBoolean(n)) {
				return false;
			}

			if (this.isString(n)) {
				return ''.padEnd(size, ' ');
			}

			if (this.isBinary(n)) {
				let arr = [];
				for(let i = 0; i < size; i++) {
					arr.push(0);
				}
				return Buffer.from(arr);
			}

			return null;
		}
	})

	return ItemFormat;
})();

