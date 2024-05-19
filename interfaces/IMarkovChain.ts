export interface IMarkovChain {
    Train(data: string): Promise<void>;
    Generate(): Promise<string>;
}