/*
 * Copyright 2019 Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {HttpResponse, Status} from '../http/HttpResponse';

const enum ResponseKeys {
    Capture = 'cp',
    SendInterval = 'si',
    MonitorName = 'bn',
    ServerId = 'id',
    MaxBeaconSize = 'bl',
    CaptureErrors = 'er',
    CaptureCrashes = 'cr',
    Multiplicity = 'mp',
}

export class StatusResponse {
    private _capture?: boolean;
    private _sendInterval?: number;
    private _monitorName?: string;
    private _serverID?: number;
    private _maxBeaconSize?: number;
    private _captureErrors?: boolean;
    private _captureCrashes?: boolean;
    private _multiplicity?: number;

    private _valid: boolean = true;

    private readonly _status: Status;

    public get capture(): boolean | undefined {
        return this._capture;
    }

    public get sendInterval(): number | undefined {
        return this._sendInterval;
    }

    public get monitorName(): string | undefined {
        return this._monitorName;
    }

    public get serverID(): number | undefined {
        return this._serverID;
    }

    public get maxBeaconSize(): number | undefined {
        return this._maxBeaconSize;
    }

    public get captureErrors(): boolean | undefined {
        return this._captureErrors;
    }

    public get captureCrashes(): boolean | undefined {
        return this._captureCrashes;
    }

    public get multiplicity(): number | undefined {
        return this._multiplicity;
    }

    public get valid(): boolean {
        return this._valid;
    }

    public get status(): Status {
        return this._status;
    }

    constructor(response: HttpResponse) {
        this._status = response.getStatus();
        this.parseResponse(response);
    }

    private parseResponse(response: HttpResponse): void {
        const keyValueEntries = response.getValues();

        // tslint:disable-next-line:no-string-literal
        if (keyValueEntries['type'] !== 'm') {
            this._valid = false;
            return;
        }

        Object
            .keys(keyValueEntries)
            .forEach(key => this.parseEntry(key, keyValueEntries[key]));
    }

    private parseEntry(key: string, value: string): void {
        switch (key) {
            case ResponseKeys.Capture:
                this._capture = value === '1';
                break;
            case ResponseKeys.CaptureCrashes:
                // 1 (always on) and 2 (only on WiFi) are treated the same
                this._captureCrashes = parseInt(value, 10) !== 0;
                break;
            case ResponseKeys.CaptureErrors:
                // 1 (always on) and 2 (only on WiFi) are treated the same
                this._captureErrors = parseInt(value, 10) !== 0;
                break;
            case ResponseKeys.MaxBeaconSize:
                this._maxBeaconSize = parseInt(value, 10);
                break;
            case ResponseKeys.MonitorName:
                this._monitorName = value;
                break;
            case ResponseKeys.Multiplicity:
                this._multiplicity = parseInt(value, 10);
                break;
            case ResponseKeys.SendInterval:
                this._sendInterval = parseInt(value, 10);
                break;
            case ResponseKeys.ServerId:
                this._serverID = parseInt(value, 10);
        }
    }
}
