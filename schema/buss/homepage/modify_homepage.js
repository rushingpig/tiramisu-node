module.exports = {
    type: 'array',
    properties: {
        items: {
            type: 'object',
            properties: {
                regionalism_ids: {
                    type: 'array',
                    required: true,
                    properties: {
                        items: {
                            type: "number"
                        }
                    }
                },
                datas: {
                    type: "array",
                    properties: {
                        items: {
                            type: "object",
                            required: true,
                            properties: {
                                src: {
                                    type: "string",
                                    required: true,
                                },
                                url: {
                                    type: "string",
                                    required: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};