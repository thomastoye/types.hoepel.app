import { Discount } from "../models/discount";
import { Price } from "../models/price";

describe("Price", () => {
    it("Add cents to euros when >= 100", () => {
        const result = new Price({ cents: 111, euro: 4 });
        expect(result.euro).toEqual(5);
        expect(result.cents).toEqual(11);
    });

    it("Correctly add prices together", () => {
        const one = new Price({ euro: 2, cents: 50 });
        const two = new Price({ euro: 3, cents: 70 });
        const result = Price.zero.add(one).add(two).add({ euro: 1, cents: 20 });

        expect(result.cents).toEqual(40);
        expect(result.euro).toEqual(7);
    });

    it("Should not allow creation of negative prices", () => {
        expect(() => new Price({ euro: 0, cents: -1 })).toThrow();
        expect(() => new Price({ euro: -1, cents: 0 })).toThrow();
        expect(Price.zero.subtract(new Price({ euro: 1, cents: 0 })).totalCents).toEqual(0);
    });

    it("Correctly subtract prices", () => {
        const one = new Price({ euro: 2, cents: 70 });
        const two = new Price({ euro: 3, cents: 50 });
        const result = two.subtract(one).subtract(Price.zero);

        expect(result.cents).toEqual(80);
        expect(result.euro).toEqual(0);
    });

    it("Price#totalCents should return total euro centns", () => {
        expect(new Price({ euro: 12, cents: 30 }).totalCents).toEqual(1230);
    });

    it("Price#toString should format price in euro format", () => {
        expect(new Price({ euro: 12, cents: 30 }).toString()).toEqual("€12.30");
        expect(new Price({ euro: 12, cents: 0 }).toString()).toEqual("€12.00");
        expect(new Price({ euro: 12, cents: 3 }).toString()).toEqual("€12.03");
        expect(new Price({ euro: 0, cents: 0 }).toString()).toEqual("€0.00");
        expect(new Price({ euro: 0, cents: 7 }).toString()).toEqual("€0.07");
    });

    it("Apply absolute discounts", () => {
        const price1 = new Price({ euro: 10, cents: 0 });
        const price2 = new Price({ euro: 6, cents: 57 });

        const discount1 = new Discount({ absoluteDiscount: { euro: 3, cents: 0 }, name: "test" });
        const discount2 = new Discount({ absoluteDiscount: { euro: 2, cents: 99 }, name: "test" });

        expect(price1.applyDiscount(discount1).totalCents).toEqual(700);
        expect(price2.applyDiscount(discount1).totalCents).toEqual(357);
        expect(price2.applyDiscount(discount2).totalCents).toEqual(358);
        expect(price1.applyDiscount(discount2).totalCents).toEqual(701);
        expect(Price.zero.applyDiscount(discount1).totalCents).toEqual(0);
    });

    it("Apply relative discounts", () => {
        const price1 = new Price({ euro: 10, cents: 0 });
        const price2 = new Price({ euro: 6, cents: 57 });

        const discount1 = new Discount({ relativeDiscount: 100, name: "test" });
        const discount2 = new Discount({ relativeDiscount: 20, name: "test" });
        const discount3 = new Discount({ relativeDiscount: 0, name: "test" });
        const discount4 = new Discount({ relativeDiscount: 33, name: "test" });

        expect(price1.applyDiscount(discount1).totalCents).toEqual(0);
        expect(price1.applyDiscount(discount2).totalCents).toEqual(800);
        expect(price1.applyDiscount(discount3).totalCents).toEqual(1000);
        expect(price1.applyDiscount(discount4).totalCents).toEqual(670);
        expect(price2.applyDiscount(discount1).totalCents).toEqual(0);
        expect(price2.applyDiscount(discount2).totalCents).toEqual(526);
        expect(price2.applyDiscount(discount3).totalCents).toEqual(657);
        expect(price2.applyDiscount(discount4).totalCents).toEqual(440);
    });

    it("Apply discounts that have both a relative and absolute component", () => {
        const price1 = new Price({ euro: 10, cents: 0 });
        const price2 = new Price({ euro: 6, cents: 57 });

        const discount1 = new Discount({ relativeDiscount: 20, absoluteDiscount: { euro: 2, cents: 50 }, name: "test" });
        const discount2 = new Discount({ relativeDiscount: 0, absoluteDiscount: { euro: 2, cents: 50 },  name: "test" });
        const discount3 = new Discount({ relativeDiscount: 33, absoluteDiscount: { euro: 3, cents: 22 }, name: "test" });

        expect(price1.applyDiscount(discount1).totalCents).toEqual(600);
        expect(price1.applyDiscount(discount2).totalCents).toEqual(750);
        expect(price1.applyDiscount(discount3).totalCents).toEqual(454);
        expect(price2.applyDiscount(discount1).totalCents).toEqual(326);
        expect(price2.applyDiscount(discount2).totalCents).toEqual(407);
        expect(price2.applyDiscount(discount3).totalCents).toEqual(224);
        expect(new Price({ euro: 3, cents: 50 }).applyDiscount(discount3).totalCents).toEqual(19);
    });

    it("Apply a list of discounts", () => {
        const price1 = new Price({ euro: 10, cents: 0 });

        const discount1 = new Discount({ relativeDiscount: 20, absoluteDiscount: { euro: 2, cents: 50 }, name: "test" });
        const discount2 = new Discount({ relativeDiscount: 0, absoluteDiscount: { euro: 2, cents: 50 },  name: "test" });
        const discount3 = new Discount({ relativeDiscount: 33, absoluteDiscount: { euro: 3, cents: 22 }, name: "test" });

        expect(price1.applyAllDiscounts([ discount1 ]).totalCents).toEqual(600);
        expect(price1.applyAllDiscounts([ discount2, discount1 ]).totalCents).toEqual(400);
        expect(price1.applyAllDiscounts([ discount1, discount2 ]).totalCents).toEqual(350);
        expect(price1.applyAllDiscounts([ discount1, discount2, discount3 ]).totalCents).toEqual(19);
        expect(price1.applyAllDiscounts([ discount1, discount2, discount2 ]).totalCents).toEqual(100);
        expect(price1.applyAllDiscounts([ discount2, discount2, discount2 ]).totalCents).toEqual(250);
    });

    it("Should total prices", () => {
        const price1 = new Price({ euro: 10, cents: 0 });
        const price2 = new Price({ euro: 6, cents: 57 });
        const price3 = new Price({ euro: 0, cents: 0 });

        const total = Price.total(price1, price2, price2, price3);

        expect(total.euro).toEqual(23);
        expect(total.cents).toEqual(14);
    });

    it("Should multiply prices", () => {
        const price1 = new Price({ euro: 10, cents: 0 });
        const price2 = new Price({ euro: 6, cents: 57 });
        const price3 = new Price({ euro: 12, cents: 69 });

        expect(price1.multiply(1).euro).toEqual(10);
        expect(price1.multiply(1).cents).toEqual(0);
        expect(price2.multiply(2).euro).toEqual(13);
        expect(price2.multiply(2).cents).toEqual(14);
        expect(price2.multiply(0).euro).toEqual(0);
        expect(price2.multiply(0).cents).toEqual(0);
        expect(price2.multiply(-5).euro).toEqual(0);
        expect(price2.multiply(-5).cents).toEqual(0);
        expect(price3.multiply(3.5).euro).toEqual(44);
        expect(price3.multiply(3.5).cents).toEqual(42);
    });
});