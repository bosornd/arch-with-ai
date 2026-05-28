export interface AnalysisRequest {
  countIds: string[];
  startTime: Date;
  endTime: Date;
  options?: Record<string, any>;
}

export interface AnalysisResult {
  type: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface IAnalysisStrategy {
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
  getType(): string;
}
