/*
 * Copyright 2019 Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Session } from './Session';

export type InitCallback = (success: boolean) => void;

/**
 * OpenKit public interface
 */
export interface OpenKit {
    /**
     * Checks if OpenKit has successfully initialized.
     *
     * @return true if OpenKit initialized successfully, false otherwise.
     */
    isInitialized(): boolean;

    /**
     * Creates a new session and returns its instance.
     *
     * @param clientIp the clients ip
     */
    createSession(clientIp?: string): Session;

    /**
     * The same as {@link waitForInit}, but with a timeout in milliseconds. If the time runs out before the
     * initialization has completed, the callback is called with false. Otherwise it behaves the same as
     * {@link waitForInit}.
     *
     * @param callback The callback which is executed after initialization, or after the timeout runs out.
     * @param timeout The timeout for the initialization
     */
    waitForInit(callback: InitCallback, timeout?: number): void;

    /**
     * Shutdown OpenKit.
     * All open session are closed and send to the Beacon.
     */
    shutdown(): void;
}
