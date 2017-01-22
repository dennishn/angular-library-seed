import {Injectable} from '@angular/core';

export interface INHttpConfig {
    globalHeaders: Array<Object>;
    nMeta: {
        platform: string
        environment: string
    }
}

export interface INHttpConfigOptional {
    globalHeaders?: Array<Object>;
}

export const NHttpConfigDefaults: INHttpConfig = {
    globalHeaders: [{
        'N-Meta': 'web;development'
    }],
    nMeta: {
        platform: 'web',
        environment: 'development'
    }
};

export class NHttpConfig {
    private _config: INHttpConfig;

    constructor(config?: INHttpConfigOptional) {
        config = config || {};
        this._config = Object.assign({}, NHttpConfigDefaults, config);
    }

    public getConfig(): INHttpConfig {
        return this._config;
    }
}