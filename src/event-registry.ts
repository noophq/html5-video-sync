export interface EventListener {
    target: Element;
    eventType: string;
    listener: any;
}

export class EventRegistry {
    private eventListeners: EventListener[];

    constructor() {
        this.eventListeners = [];
    }

    public register(target: Element, eventType: string, listener: any) {
        this.eventListeners.push({
            target,
            eventType,
            listener,
        });
        target.addEventListener(eventType, listener);
    }

    public unregister(eventType: string) {
        this.eventListeners.forEach((eventListener) => {
            if (eventListener.eventType != eventType) {
                return;
            }

            eventListener.target.removeEventListener(
                eventListener.eventType,
                eventListener.listener,
            );
        });
        this.eventListeners.filter((eventListener) => {
            return (eventListener.eventType != eventType);
        });
    }

    public unregisterAll() {
        this.eventListeners.forEach((eventListener) => {
            eventListener.target.removeEventListener(
                eventListener.eventType,
                eventListener.listener,
            );
        });
        this.eventListeners = [];
    }
}
