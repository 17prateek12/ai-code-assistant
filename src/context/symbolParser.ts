export class SymbolParser {

    extractSymbols(
        content: string
    ) {

        const symbols: string[] = [];

        // function foo()
        const functionMatches = content.matchAll(
                /function\s+(\w+)/g
            );

        for (const match of functionMatches) {
            symbols.push(match[1]);
        }

        // const foo = ()
        const arrowMatches = content.matchAll(
                /const\s+(\w+)\s*=\s*\(/g
            );

        for (const match of arrowMatches) {
            symbols.push(match[1]);
        }

        // const Foo: React.FC = ()
        const typedArrowMatches = content.matchAll(
                /const\s+(\w+)\s*:\s*[\w.<>, ]+\s*=\s*\(/g
            );

        for (const match of typedArrowMatches) {
            symbols.push(match[1]);
        }

        // export default function Foo()
        const exportFunctionMatches = content.matchAll(
                /export\s+default\s+function\s+(\w+)/g
            );

        for (const match of exportFunctionMatches) {
            symbols.push(match[1]);
        }

        // class Foo
        const classMatches = content.matchAll(
                /class\s+(\w+)/g
            );

        for (const match of classMatches) {
            symbols.push(match[1]);
        }

        // interface Foo
        const interfaceMatches = content.matchAll(
                /interface\s+(\w+)/g
            );

        for (const match of interfaceMatches) {
            symbols.push(match[1]);
        }

        return [...new Set(symbols)];
    }
}