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

import { agentTechnologyType, openKitVersion, platformTypeOpenKit, protocolVersion } from '../../PlatformConstants';
import { Configuration } from '../config/Configuration';
import { ActionImpl } from '../impl/ActionImpl';
import { EventType } from '../protocol/EventType';
import { PayloadKey } from '../protocol/PayloadKey';
import { PayloadQueryBuilder } from './builder/PayloadQueryBuilder';

export class PayloadBuilder {
    public static startSession(sequenceNumber: number): string {
        return PayloadBuilder
            .basicEventData(EventType.SessionStart)
            .add(PayloadKey.ParentActionId, 0)
            .add(PayloadKey.StartSequenceNumber, sequenceNumber)
            .add(PayloadKey.Time0, 0)
            .build();
    }

    public static endSession(sequenceNumber: number, duration: number): string {
        return PayloadBuilder
            .basicEventData(EventType.SessionEnd)
            .add(PayloadKey.ParentActionId, 0)
            .add(PayloadKey.StartSequenceNumber, sequenceNumber)
            .add(PayloadKey.Time0, duration)
            .build();
    }

    public static action(action: ActionImpl, sessionStartTime: number): string {
        return PayloadBuilder
            .basicEventData(EventType.ManualAction, action.name)
            .add(PayloadKey.ActionId, action.actionId)
            .add(PayloadKey.ParentActionId, 0)
            .add(PayloadKey.StartSequenceNumber, action.startSequenceNumber)
            .add(PayloadKey.EndSequenceNumber, action.endSequenceNumber!)
            .add(PayloadKey.Time0, action.startTime - sessionStartTime)
            .add(PayloadKey.Time1, action.endTime - action.startTime)
            .build();
    }

    public static prefix(config: Configuration, sessionId: number, clientIpAddress: string): string {
        return new PayloadQueryBuilder()
            .add(PayloadKey.ProtocolVersion, protocolVersion)
            .add(PayloadKey.OpenKitVersion, openKitVersion)
            .add(PayloadKey.ApplicationId, config.applicationId)
            .add(PayloadKey.ApplicationName, config.applicationName)
            .addIfDefined(PayloadKey.ApplicationVersion, config.applicationVersion)
            .add(PayloadKey.PlatformType, platformTypeOpenKit)
            .add(PayloadKey.AgentTechnologyType, agentTechnologyType)

            .add(PayloadKey.VisitorId, config.deviceId)
            .add(PayloadKey.SessionNumber, sessionId)
            .add(PayloadKey.ClientIpAddress, clientIpAddress)

            .add(PayloadKey.DataCollectionLevel, config.dataCollectionLevel)
            .add(PayloadKey.CrashReportingLevel, config.crashReportingLevel)
            .build();
    }

    public static mutable(sessionStartTime: number, multiplicity: number, transmissionTime: number): string {
        return new PayloadQueryBuilder()
            .add(PayloadKey.SessionStartTime, sessionStartTime)
            .add(PayloadKey.Multiplicity, multiplicity)
            .add(PayloadKey.TransmissionTime, transmissionTime)
            .build();
    }

    public static reportValue(
        action: ActionImpl,
        name: string,
        value: number | string | null | undefined,
        sequenceNumber: number,
        timestamp: number,
        sessionStartTime: number,
    ): string {
        const eventType = typeof value === 'number' ? EventType.ValueDouble : EventType.ValueString;

        return PayloadBuilder
            .basicEventData(eventType, name)
            .add(PayloadKey.ParentActionId, action.actionId)
            .add(PayloadKey.StartSequenceNumber, sequenceNumber)
            .add(PayloadKey.Time0, timestamp - sessionStartTime)
            .addIfDefinedAndNotNull(PayloadKey.Value, value)
            .build();
    }

    public static identifyUser(
        userTag: string,
        sequenceNumber: number,
        timestamp: number,
        sessionStartTime: number): string {
        return PayloadBuilder
            .basicEventData(EventType.IdentifyUser, userTag)
            .add(PayloadKey.ParentActionId, 0)
            .add(PayloadKey.StartSequenceNumber, sequenceNumber)
            .add(PayloadKey.Time0, timestamp - sessionStartTime)
            .build();
    }

    private static basicEventData(eventType: EventType, name?: string): PayloadQueryBuilder {
        return new PayloadQueryBuilder()
            .add(PayloadKey.EventType, eventType)
            .addIfDefined(PayloadKey.KeyName, name)
            .add(PayloadKey.ThreadId, 1);
    }
}