/*
 *  This file is part of the NOOP organization .
 *
 *  (c) Cyrille Lebeaupin <clebeaupin@noop.fr>
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import { VideoSynchronizer } from "./synchronizer";

export function sync(
    mainVideoElement: HTMLVideoElement,
    syncedVideoElements: HTMLVideoElement[],
) {
    const synchronizer = new VideoSynchronizer(
        mainVideoElement,
        syncedVideoElements
    );
    return synchronizer;
}
