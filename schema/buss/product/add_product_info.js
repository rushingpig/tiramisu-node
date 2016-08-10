module.exports = {
    type: 'object',
    properties: {
        product_id: {
            type: "number"
        },
        infos: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    regionalism_ids: {
                        type: 'array',
                    },
                    info: {
                        type: "object",
                        properties: {
                            detail_img_1: {type: "string"},
                            detail_img_2: {type: "string"},
                            detail_img_3: {type: "string"},
                            detail_img_4: {type: "string"},
                            detail_template_copy: {type: "string"},
                            detail_template_copy_end: {type: "string"},
                            detail_top_copy: {type: "string"},
                            list_copy: {type: "string"},
                            list_img: {type: "string"},
                            sepc: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        key: {type: "string"},
                                        value: {type: "string"}
                                    }
                                }
                            },
                            template_data: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        key: {type: "string"},
                                        value: {type: "string"}
                                    }
                                }
                            }
                        }
                    },

                }
            }
        }
    }
};