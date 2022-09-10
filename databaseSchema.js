const { Schema } = require('mongoose')

module.exports = new Schema({
	_id: {
		type: String,
		required: true
	},
	prefix: {
		type: String,
		required: true
	},
	volume: {
		type: Number,
		required: true
	},
	djOnly: {
        enabled: { type: Boolean, required: true },
        roleId: { type: String, required: false }
	}
})