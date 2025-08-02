/**
 * WebSocket factory utility that provides Node.js compatibility.
 * 
 * Uses the 'ws' package for reliable WebSocket implementation across all Node.js versions.
 * This ensures consistent behavior and avoids close event issues in Node.js < 24.
 */

import { TransportError } from "../base.ts";
// @ts-ignore - ws types not available during Deno build
import WebSocket from "ws";

/** Error thrown when WebSocket creation fails due to compatibility issues. */
export class WebSocketCompatibilityError extends TransportError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "WebSocketCompatibilityError";
    }
}

/**
 * Creates a WebSocket instance using the 'ws' package for reliable Node.js compatibility.
 * 
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns WebSocket instance
 */
export function createCompatibleWebSocketSync(url: string | URL, protocols?: string | string[]): WebSocket {
    try {
        return new WebSocket(url, protocols) as unknown as WebSocket;
    } catch (error) {
        throw new WebSocketCompatibilityError(
            `Failed to create WebSocket: ${error}`,
            { cause: error }
        );
    }
}

/**
 * Creates a WebSocket instance using the 'ws' package for reliable Node.js compatibility.
 * 
 * @param url - WebSocket URL
 * @param protocols - WebSocket protocols
 * @returns Promise resolving to WebSocket instance
 */
export async function createCompatibleWebSocket(url: string | URL, protocols?: string | string[]): Promise<WebSocket> {
    return createCompatibleWebSocketSync(url, protocols);
}

/**
 * Always returns false since we now use 'ws' package for all environments.
 * Kept for backward compatibility.
 */
export function requiresWsPackage(): boolean {
    return false;
}

/**
 * Gets environment information for debugging purposes.
 * Now always indicates 'ws' package is used for consistent behavior.
 */
export function getWebSocketEnvironmentInfo(): {
    isNode: boolean;
    nodeMajorVersion: number | null;
    hasReliableNativeWebSocket: boolean;
    requiresWsPackage: boolean;
} {
    // Use globalThis to avoid TypeScript errors during Deno build
    const globalProcess = (globalThis as any).process;
    const isNode = typeof globalProcess !== "undefined" && globalProcess.versions?.node;
    const nodeMajorVersion = isNode ? parseInt(globalProcess.versions.node.split(".")[0], 10) : null;
    
    return {
        isNode: !!isNode,
        nodeMajorVersion,
        hasReliableNativeWebSocket: true, // Always true since we use 'ws' package
        requiresWsPackage: false, // Always false since 'ws' is now a regular dependency
    };
}