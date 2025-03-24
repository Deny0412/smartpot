import mongoose from "mongoose";

export class MongoValidator {
    static isValidObjectId(id: string | undefined | null): boolean {
        return !!id && mongoose.Types.ObjectId.isValid(id);
    }

    static validateId(id: string | undefined | null): void {
        if (!this.isValidObjectId(id)) {
            throw new Error("Invalid MongoDB ObjectId format");
        }
    }

    static validateIds(ids: (string | undefined | null)[]): void {
        ids.forEach(id => {
            if (!this.isValidObjectId(id)) {
                throw new Error(`Invalid MongoDB ObjectId format: ${id}`);
            }
        });
    }
} 