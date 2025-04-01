import { IHousehold } from "@/models/Household";
import { Types } from "mongoose";
import { FastifyRequest, FastifyReply } from 'fastify';
import householdGetDao from "../dao/household/household-get-dao";

function isOwner(household: IHousehold, userId: string) {
    return household.owner.equals(new Types.ObjectId(userId));
}

function isMember(household: IHousehold, userId: string) {
    return household.members.some(member => member.equals(new Types.ObjectId(userId)));
}

// Define a type for the user object
interface IUser {
    id: string;
}

export function householdAuthMidlleware(authorizedRole: string[]) {
    console.log("householdAuth Middleware called", authorizedRole);
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (authorizedRole.length === 0) {
            return reply.code(500).send({ error: "No authorized roles provided" });
        }
        // Kontrola, zda je v cestě 'household'
        const isHouseholdRoute: boolean = request.routerPath?.includes("household") ?? false;

        // Pokud je v cestě "household", bere `id`, jinak `household_id`
        const householdIdKey: "id" | "household_id" = isHouseholdRoute ? "id" : "household_id";

        // Hledání ID v query, params nebo body (v tomto pořadí)
        const householdId: string | undefined = 
            (request.query as Record<string, string | undefined>)?.[householdIdKey] 
            || (request.params as Record<string, string | undefined>)?.[householdIdKey] 
            || (request.body as Record<string, string | undefined>)?.[householdIdKey];
            
        if (!householdId) {
            return reply.code(400).send({ error: "Household ID is required" });
        }

        const household = await householdGetDao(householdId) as IHousehold;
        const userId = (request.user as { user?: { id?: string } })?.user?.id;

        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized: User ID missing" });
        }
        

        let hasAccess = false;

        for (const role of authorizedRole) {
            if (role === "owner" && isOwner(household, userId)) {
                hasAccess = true;
                break;
            }
            if (role === "member" && isMember(household, userId)) {
                hasAccess = true;
                break;
            }
        }

        if (!hasAccess) {
            return reply.code(403).send({ error: "Access denied" });
        }

        return;
    };
}
