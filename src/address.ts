/**
 * A physical street address
 */
export interface IAddress {
    /**
     * The street component of the address, e.g. 'Baker Street'
     */
    readonly street?: string;
    /**
     * The house number, e.g. '12A'
     */
    readonly number?: string;
    /**
     * The zip code of the city, e.g. '1200'
     * @TJS-type integer
     */
    readonly zipCode?: number;
    /**
     * The city, e.g. 'Brussels'
     */
    readonly city?: string;
}

export class Address implements IAddress {
    readonly city?: string;
    readonly number?: string;
    readonly street?: string;
    readonly zipCode?: number;

    constructor(obj: IAddress) {
        this.city = obj.city;
        this.number = obj.number;
        this.street = obj.street;
        this.zipCode = obj.zipCode;
    }

    get isValid(): boolean {
        return Boolean(this.street) && Boolean(this.number) && Boolean(this.zipCode) && Boolean(this.city);
    }

    getGoogleMapsLink(): string {
        const encoded = encodeURI(`${this.street} ${this.number}, ${this.zipCode} ${this.city}`);
        return `https://maps.google.com/?q=${encoded}`;
    }
}
