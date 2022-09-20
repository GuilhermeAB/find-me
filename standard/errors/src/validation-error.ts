const ERROR_NAME = 'ValidationError';

type ParamsType = Record<string, string | number | boolean>;

interface ValidationErrorProps {
  code: string,
  params?: ParamsType,
}

export class ValidationError extends Error {
  private props: ValidationErrorProps;

  public get code(): string {
    return this.props.code;
  }

  public get params(): ParamsType | undefined {
    return this.props.params;
  }

  constructor(props: ValidationErrorProps) {
    super(props.code);

    this.name = ERROR_NAME;
    this.props = props;

    Error.captureStackTrace(this, ValidationError);
  }
}
