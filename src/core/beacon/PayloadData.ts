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

import { DataCollectionLevel } from '../../api';
import { PrivacyConfiguration } from '../config/Configuration';
import { ActionImpl } from '../impl/ActionImpl';
import { WebRequestTracerImpl } from '../impl/WebRequestTracerImpl';
import { Payload } from '../payload.v2/Payload';
import { PayloadBuilder } from '../payload.v2/PayloadBuilder';
import { SequenceIdProvider } from '../provider/SequenceIdProvider';
import { defaultTimestampProvider, TimestampProvider } from '../provider/TimestampProvider';
import { PayloadBuilder as StaticPayloadBuilder } from './PayloadBuilder';

/**
 * Responsible for creating and holding all payload data for a session.
 */
export class PayloadData {
    private readonly sequenceId = new SequenceIdProvider();
    private readonly nextId = new SequenceIdProvider();
    private readonly timestampProvider: TimestampProvider;

    constructor(
        private readonly config: PrivacyConfiguration,
        public readonly payloadBuilder: PayloadBuilder,
        private readonly sessionStartTime: number,
        timestampProvider: TimestampProvider = defaultTimestampProvider) {
        this.timestampProvider = timestampProvider;
    }

    public createId(): number {
        return this.nextId.next();
    }

    public createSequenceNumber(): number {
        return this.sequenceId.next();
    }

    public startSession(): void {
        this.addPayload(StaticPayloadBuilder.startSession(this.createSequenceNumber()));
    }

    public endSession(): void {
        const duration = this.timestampProvider.getCurrentTimestamp() - this.sessionStartTime;
        this.addPayload(StaticPayloadBuilder.endSession(this.createSequenceNumber(), duration));
    }

    public addAction(action: ActionImpl): void {
        this.addPayload(StaticPayloadBuilder.action(action, this.sessionStartTime));
    }

    public reportValue(action: ActionImpl, name: string, value: number | string | null | undefined): void {
        this.addPayload(StaticPayloadBuilder.reportValue(
            action,
            name,
            value,
            this.createSequenceNumber(),
            this.timestampProvider.getCurrentTimestamp(),
            this.sessionStartTime));
    }

    public identifyUser(userTag: string): void {
        this.addPayload(StaticPayloadBuilder.identifyUser(
            userTag,
            this.createSequenceNumber(),
            this.timestampProvider.getCurrentTimestamp(),
            this.sessionStartTime));
    }

    public reportError(parentActionId: number, name: string, code: number, message: string): void {
        this.addPayload(StaticPayloadBuilder.reportError(
            name,
            parentActionId,
            this.createSequenceNumber(),
            this.timestampProvider.getCurrentTimestamp() - this.sessionStartTime,
            message,
            code,
        ));
    }

    public reportCrash(errorName: string, reason: string, stacktrace: string): void {
        this.addPayload(StaticPayloadBuilder.reportCrash(
            errorName,
            reason,
            stacktrace,
            this.createSequenceNumber(),
            this.sessionStartTime,
            this.timestampProvider.getCurrentTimestamp(),
        ));
    }

    public reportEvent(actionId: number, name: string): void {
        this.addPayload(StaticPayloadBuilder.reportNamedEvent(
            name,
            actionId,
            this.createSequenceNumber(),
            this.timestampProvider.getCurrentTimestamp() - this.sessionStartTime));
    }

    public currentTimestamp(): number {
        return this.timestampProvider.getCurrentTimestamp();
    }

    public addWebRequest(webRequest: WebRequestTracerImpl, parentActionId: number): void {
        if (this.config.dataCollectionLevel === DataCollectionLevel.Off) {
            return;
        }

        this.addPayload(StaticPayloadBuilder.webRequest(
            webRequest.getUrl(),
            parentActionId,
            webRequest.getStartSequenceNumber(),
            this.currentTimestamp() - webRequest.getStart(),
            webRequest.getEndSequenceNumber(),
            webRequest.getDuration(),
            webRequest.getBytesSent(),
            webRequest.getBytesReceived(),
            webRequest.getResponseCode(),
        ));
    }

    private addPayload(payload: Payload): void {
        this.payloadBuilder.push_unchecked(payload);
    }
}
