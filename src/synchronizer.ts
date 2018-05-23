/*
 *  This file is part of the NOOP organization .
 *
 *  (c) Cyrille Lebeaupin <clebeaupin@noop.fr>
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import * as raf from "raf";

interface VideoAction {
    timecode: number, // in milliseconds
    action: string;
}

export class VideoSynchronizer {
    private mainVideoElement: HTMLVideoElement;
    private syncedVideoElements: HTMLVideoElement[];

    private lastActions: VideoAction[];
    private synchronizing: boolean;
    private syncDeviationThreshold: number;
    private rafCountSinceLastSyncFix: number

    public constructor(
        mainVideoElement: HTMLVideoElement,
        syncedVideoElements: HTMLVideoElement[]
    ) {
        this.mainVideoElement = mainVideoElement;
        this.syncedVideoElements = syncedVideoElements;

        this.syncDeviationThreshold = 80;
        this.lastActions = [];
        this.rafCountSinceLastSyncFix = 0;
        this.synchronizing = false;

        this.handlePlay = this.handlePlay.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleSeek = this.handleSeek.bind(this);
        this.handleSynchronized = this.handleSynchronized.bind(this);
        this.handleSynchronizing = this.handleSynchronizing.bind(this);
        this.handleFixVideoSynchronization = this.handleFixVideoSynchronization.bind(this);

        this.initialize();
    }

    private initialize() {
        this.addMainVideoListeners();
        this.addSyncedVideoListeners();
        this.refresh();
    }

    public destroy() {
        this.removeMainVideoListeners();
        this.removeSyncedVideoListeners();
    }

    private dispatchEvent(element: HTMLElement, eventType: string) {
        let newEvent;

        // IE 11 does not have an Event constructor
        if (typeof (Event) === 'function') {
            newEvent = new Event(eventType);
        } else {
            newEvent = document.createEvent('Event');
            newEvent.initEvent(eventType, false, true);
        }

        element.dispatchEvent(newEvent);
    }

    /** Return true if videos are synchronized */
    private isSynced(): boolean {
        // Test if all videos are synchronized and can play
        if (this.mainVideoElement.readyState < 4) {
            return false;
        }

        for (const element of this.syncedVideoElements) {
            const deviation = this.processSyncedVideoDeviation(element);
            console.log(deviation, element.readyState);

            if (deviation > this.syncDeviationThreshold) {
                // This video is not yet synchronized
                return false;
            }

            if (element.readyState < 4) {
                // This video is not yet ready
                return false;
            }
        }

        return true;
    }

    private registerAction(action: string) {
        if (this.synchronizing) {
            // Do not register action while synchronising
            return;
        }

        this.lastActions.unshift({
            timecode: this.mainVideoElement.currentTime*1000,
            action,
        });

        // Only keep last 5 actions
        this.lastActions = this.lastActions.slice(0, 5);
    }

    /**
     * Dispatch sync event
     * Sync events are sent to main and synced videos
     * @param eventType Name of event
     */
    private dispatchSyncEvent(eventType: string) {
        this.dispatchEvent(this.mainVideoElement, eventType);
        this.syncedVideoElements.forEach((element) => {
            this.dispatchEvent(element, eventType);
        });
    }

    /**
     * Pause all videos
     */
    private pauseAll() {
        console.log("pause all");
        this.syncedVideoElements.forEach((element) => {
            element.pause();
        });

        if (!this.mainVideoElement.paused) {
            // Avoid event loops
            this.mainVideoElement.pause();
        }
    }

    /**
     * Play all videos
     */
    private playAll() {
        console.log("play all");
        if (this.mainVideoElement.paused) {
            // Avoid event loops
            this.mainVideoElement.play();
        }

        this.syncedVideoElements.forEach((element) => {
            element.play();
        });
    }

    private processSyncedVideoDeviation(element: HTMLVideoElement) {
        return Math.abs((
            this.mainVideoElement.currentTime -
            element.currentTime
        ) * 1000);
    }

    /**
     * Refresh video
     */
    private refresh() {
        // Check synchronisation every 25 refreshs
        if (this.rafCountSinceLastSyncFix++ > 25) {
            this.rafCountSinceLastSyncFix = 0;
            this.testAndFixSync();
        }

        raf(() => { this.refresh(); });
    }

    private testAndFixSync() {
        if (this.isSynced()) {
            if (!this.synchronizing) {
                return;
            }

            // Videos are now synchronized
            this.synchronizing = false;
            return this.dispatchSyncEvent("synchronized");
        }

        if (!this.synchronizing) {
            this.synchronizing = true;
            this.dispatchSyncEvent("synchronizing");
        }

        // Try to fix synchronization
        for (const element of this.syncedVideoElements) {
            const deviation = this.processSyncedVideoDeviation(element);

            // Deviation is bigger than 2s
            // Pause all videos
            if (deviation > 200) {
                this.pauseAll();
            }

            this.dispatchEvent(element, "fix-synchronization");
        }
    }

    private handleFixVideoSynchronization(event: any) {
        event.target.pause();
        event.target.currentTime = this.mainVideoElement.currentTime
    }

    private handleSynchronizing() {
        console.log("synchronizing");
    }

    /**
     * Returns true if video was playing before starting synchronisation
     */
    private wasPlayingBeforeSync() {
        if (this.lastActions.length == 0) {
            return false;
        }

        if (this.lastActions[0].action === "play") {
            return true;
        }

        // pause was done just before seek so look at the the third action
        if (this.lastActions.length > 2 &&
            this.lastActions[0].action === "seek") {
            // Remove all actions closed to seek timecode
            const seekTimecode = this.lastActions[0].timecode;

            for (const lastAction of this.lastActions.slice(1)) {
                if (Math.abs(seekTimecode - lastAction.timecode) > 500) {
                    return (lastAction.action === "play");
                }
            }
        }

        return false;
    }

    private handleSynchronized() {
        console.log("synchronized", this.lastActions);

        if (this.wasPlayingBeforeSync()) {
            this.mainVideoElement.play();
        } else {
            this.mainVideoElement.pause();
        }
    }

    private handleSeek() {
        console.log("#seek");
        this.registerAction("seek");
    }

    private handlePlay(event: any) {
        this.registerAction("play");
        if (this.synchronizing) {
            event.preventDefault();
        }

        this.playAll();
    }

    private handlePause() {
        this.registerAction("pause");
        this.pauseAll();
    }

    private addMainVideoListeners() {
        this.mainVideoElement.addEventListener(
            "synchronizing",
            this.handleSynchronizing
        );
        this.mainVideoElement.addEventListener(
            "synchronized",
            this.handleSynchronized
        );
        this.mainVideoElement.addEventListener(
            "play",
            this.handlePlay
        );
        this.mainVideoElement.addEventListener(
            "pause",
            this.handlePause
        );
        this.mainVideoElement.addEventListener(
            "seeking",
            this.handleSeek,
        );
    }

    private removeMainVideoListeners() {
        this.mainVideoElement.removeEventListener(
            "synchronizing",
            this.handleSynchronizing
        );
        this.mainVideoElement.removeEventListener(
            "synchronized",
            this.handleSynchronized
        );
        this.mainVideoElement.removeEventListener(
            "play",
            this.handlePlay
        );
        this.mainVideoElement.removeEventListener(
            "pause",
            this.handlePause
        );
        this.mainVideoElement.removeEventListener(
            "seeking",
            this.handleSeek,
        );
    }

    private addSyncedVideoListener(videoElement: HTMLVideoElement) {
        videoElement.addEventListener(
            "fix-synchronization",
            this.handleFixVideoSynchronization,
        );
    }

    private addSyncedVideoListeners() {
        this.syncedVideoElements.forEach((element) => {
            this.addSyncedVideoListener(element);
        });
    }

    private removeSyncedVideoListener(videoElement: HTMLVideoElement) {
        videoElement.removeEventListener(
            "fix-synchronization",
            this.handleFixVideoSynchronization,
        );
    }

    private removeSyncedVideoListeners() {
        this.syncedVideoElements.forEach((element) => {
            this.removeSyncedVideoListener(element);
        });
    }
}
