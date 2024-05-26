export interface IMarkovChain {
    Train(data: string, path: string): Promise<void>;
    Generate(path: string): Promise<string>;
}