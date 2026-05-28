export interface IDashboardFeature {
  getId(): string;
  getName(): string;
  getConfig(): Record<string, any>;
  validate(config: Record<string, any>): boolean;
}
