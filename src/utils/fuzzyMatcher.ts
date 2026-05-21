export class FuzzyMatcher {
    private distance(a: string, b: string): number {
        const matrix:number[][]= Array.from(
            { length: b.length + 1 },
            () => Array(a.length+1).fill(0)
        );
        for (let i = 0; i <= b.length; i++) {
            matrix[i][0] = i;
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    matches(
        query: string,
        target: string
    ) {
        query = query.toLowerCase();
        target = target.toLowerCase();

        //Exact
        if (query.includes(target)) {
            return true;
        }

        // Word similarity
        const words = query.split(/\s+/);
        for (const word of words) {
            const score = this.distance(word, target);
            if (score <= 2) {
                return true;
            }
        }
        return false;
    }
}