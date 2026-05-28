export class IncrementCountRequestDto {
  amount!: number;
}

export class DecrementCountRequestDto {
  amount!: number;
}

export class SetCountRequestDto {
  value!: number;
  description?: string;
}
