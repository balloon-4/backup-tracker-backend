import type { Router } from 'cloudworker-router';
// @ts-expect-error
import { Schema } from '@cfworker/json-schema';
import { type Env, Route, Telemetry } from '../@types/types';
import { addTelemetry } from '../services/telemetryService';
import { JSONBodyValidateMidware } from '../midware/JSONBodyValidateMidware';
import { executeSQL, getClient } from '../repositories/database';

// https://github.com/cloudflare/worker-template-postgres
// https://github.com/bubblydoo/cloudflare-workers-postgres-client/tree/main
// https://github.com/cloudflare/worker-template-postgres/blob/master/scripts/postgres/docker-compose.yml

export const schema: Schema = {
    $id: '#/definitions/Telemetry',
    $schema: 'http://json-schema.org/draft-07/schema#',
    properties: {
        accuracy: {
            type: ['number', 'null'],
        },
        altitude: {
            type: ['number', 'null'],
        },
        batteryPercent: {
            type: ['number', 'null'],
        },
        cellStrength: {
            type: ['number', 'null'],
        },
        date: {
            type: 'string',
        },
        latitude: {
            type: ['number', 'null'],
        },
        longitude: {
            type: ['number', 'null'],
        },
        pressure: {
            type: ['number', 'null'],
        },
        provider: {
            type: ['string', 'null'],
        },
        session: {
            type: 'string',
        },
        speed: {
            type: ['number', 'null'],
        },
        temperature: {
            type: ['number', 'null'],
        },
        timeToFix: {
            type: ['number', 'null'],
        },
    },
    required: [
        'accuracy',
        'altitude',
        'batteryPercent',
        'cellStrength',
        'date',
        'latitude',
        'longitude',
        'pressure',
        'provider',
        'session',
        'speed',
        'temperature',
        'timeToFix',
    ],
    type: 'object',
};

const midware = [new JSONBodyValidateMidware(schema).generate];

export default (router: Router<Env>) => {
    router.post(Route.TELEMETRY, ...midware, async (ctx) => {
        const requestBody = (await ctx.request.json()) as Telemetry;

        console.log(JSON.stringify(requestBody));

        const client = getClient(ctx);
        await executeSQL(client, ctx, async (db) => {
            await addTelemetry(db, requestBody);
        });

        return new Response(null, {
            status: 204,
        });
    });
};
