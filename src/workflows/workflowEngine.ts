import { WorkflowType }
from "../share/types/types";

export class WorkflowEngine {

    detectWorkflow(
        query: string
    ): WorkflowType {

        const lower =
            query.toLowerCase().trim();

        if (lower.startsWith("/onboard")) {
            return "onboard";
        }

        if (lower.startsWith("/review")) {
            return "review";
        }

        if (lower.startsWith("/debug")) {
            return "debug";
        }

        if (lower.startsWith("/explain")) {
            return "explain";
        }

        return null;
    }
}

// import { WorkflowType } from "../share/types/types";

// export class WorkflowEngine {
//     detectWorkflow(
//         query: string
//     ): WorkflowType {
//         const lower = query.toLowerCase();
//         if(lower.startsWith("/onboard")){
//             return "onboard";
//         }

//         if(lower.startsWith("/review")){
//             return "review";
//         }

//         if(lower.startsWith("/debug")){
//             return "debug";
//         }

//         if(lower.startsWith("/explain")){
//             return "explain";
//         }

//         return null
//     }
// }