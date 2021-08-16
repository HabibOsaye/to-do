module.exports = {
	multipass: true,
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					removeViewBox: true,
					removeDimensions: true,
				},
			},
		},
	],
}
