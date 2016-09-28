module.exports = {
    type: 'object',
    properties: {
        product_id: {
            type: "number",
            required: true
        },
        new_infos: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    regionalism_id: {
                        type: 'number',
                        required: true
                    },
                    detail_img_1: {
                        type: "string",
                        required: true
                    },
                    detail_img_2: {
                        type: "string",
                        required: true
                    },
                    detail_img_3: {
                        type: "string",
                        required: true
                    },
                    detail_img_4: {
                        type: "string",
                        required: true
                    },
                    consistency: {
                        type: "number",
                        required: true
                    },
                    detail_template_copy: {
                        type: "string",
                        required: true
                    },
                    detail_template_copy_end: {
                        type: "string",
                        required: true
                    },
                    detail_top_copy: {
                        type: "string",
                        required: true
                    },
                    list_copy: {
                        type: "string",
                        required: true
                    },
                    list_img: {
                        type: "string",
                        required: true
                    },
                    sepc: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                key: {
                                    type: "string"
                                },
                                value: {
                                    type: "string"
                                }
                            }
                        }
                    },
                    template_data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                key: {
                                    type: "string"
                                },
                                value: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        },
        modified_infos: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    regionalism_id: {
                        type: 'number',
                        required: true
                    },
                    detail_img_1: {
                        type: "string",
                        required: true
                    },
                    detail_img_2: {
                        type: "string",
                        required: true
                    },
                    detail_img_3: {
                        type: "string",
                        required: true
                    },
                    detail_img_4: {
                        type: "string",
                        required: true
                    },
                    consistency: {
                        type: "number",
                        required: true
                    },
                    detail_template_copy: {
                        type: "string",
                        required: true
                    },
                    detail_template_copy_end: {
                        type: "string",
                        required: true
                    },
                    detail_top_copy: {
                        type: "string",
                        required: true
                    },
                    list_copy: {
                        type: "string",
                        required: true
                    },
                    list_img: {
                        type: "string",
                        required: true
                    },
                    sepc: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                key: {
                                    type: "string"
                                },
                                value: {
                                    type: "string"
                                }
                            }
                        }
                    },
                    template_data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                key: {
                                    type: "string"
                                },
                                value: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};