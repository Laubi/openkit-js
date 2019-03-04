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

import { CommunicationChannel } from '../../../api/communication/CommunicationChannel';
import { StatusRequest } from '../../../api/communication/StatusRequest';
import { StatusResponse } from '../../../api/communication/StatusResponse';
import { LoggerFactory } from '../../../api/logging/LoggerFactory';
import { HttpClient } from './HttpClient';
import { HttpStatusResponse } from './HttpStatusResponse';
import { buildHttpUrl } from './HttpUrlBuilder';

export class HttpCommunicationChannel implements CommunicationChannel {

    constructor(
        private readonly httpClient: HttpClient,
        private readonly loggerFactory: LoggerFactory) {
        this.httpClient = httpClient;
        this.loggerFactory = loggerFactory;
    }

    public async sendNewSessionRequest(url: string, request: StatusRequest): Promise<StatusResponse> {
        const httpResponse = await this.httpClient.get(buildHttpUrl(url, request, true));

        return new HttpStatusResponse(httpResponse, this.loggerFactory);
    }

    public async sendPayloadData(url: string, request: StatusRequest, query: string): Promise<StatusResponse> {
        const httpResponse = await this.httpClient.post(buildHttpUrl(url, request, false), query);

        return new HttpStatusResponse(httpResponse, this.loggerFactory);
    }

    public async sendStatusRequest(url: string, request: StatusRequest): Promise<StatusResponse> {
        const httpResponse = await this.httpClient.get(buildHttpUrl(url, request, false));

        return new HttpStatusResponse(httpResponse, this.loggerFactory);
    }
}
