// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {OutputSettings, Output, OutputStyle, Format, Display} from "@swim/codec";

/**
 * Evidence for or against the validity of a test assertion.
 */
export abstract class Proof implements Display {
  /**
   * Returns `true` if this `Proof` supports the validity of the assertion.
   */
  abstract isValid(): boolean;

  /**
   * Returns `true` if this `Proof` is pending implementation.
   */
  isPending(): boolean {
    return false;
  }

  /**
   * Returns an optional message detailing the circumstances of the assertion.
   */
  abstract message(): string | null;

  abstract display(output: Output): void;

  toString(settings?: OutputSettings): string {
    return Format.display(this, settings);
  }

  /**
   * Returns generic `Proof` for the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static valid(operator: string, message: string | null = null): ValidProof {
    return new ValidProof(operator, message);
  }

  /**
   * Returns generic `Proof` against the validity of an `operator`, with an
   * optional `message` detailing the circumstances of the assertion.
   */
  static invalid(operator: string, message: string | null = null): InvalidProof {
    return new InvalidProof(operator, message);
  }

  /**
   * Returns specific `Proof` against the validity of a binary `operator`
   * assertion, citing contradictory left- and right-hand side operands, along
   * with an optional `message` detailing the circumstances of the assertion.
   */
  static refuted(lhs: unknown, operator: string, rhs: unknown, message: string | null = null): RefutedProof {
    return new RefutedProof(lhs, operator, rhs, message);
  }

  /**
   * Returns `Proof` against the validity of an assertion due to an `error`
   * that was thrown while evaluating the assertion, along with an optional
   * `message` detailing the circumstances of the assertion.
   */
  static error(error: unknown, message: string | null = null): ErrorProof {
    return new ErrorProof(error, message);
  }

  /**
   * Returns tentative `Proof` for the validity of an assertion that hasn't
   * yet been implemented, along with an optional `message` detailing the
   * circumstances of the assertion.
   */
  static pending(message: string | null = null): PendingProof {
    return new PendingProof(message);
  }
}

/**
 * Generic `Proof` for the validity of an assertion.
 */
export class ValidProof extends Proof {
  /** @hidden */
  readonly _operator: string;
  /** @hidden */
  readonly _message: string | null;

  constructor(operator: string, message: string | null) {
    super();
    this._operator = operator;
    this._message = message;
  }

  isValid(): boolean {
    return true;
  }

  /**
   * Returns the name of the asserted operator.
   */
  operator(): string {
    return this._operator;
  }

  message(): string | null {
    return this._message;
  }

  display(output: Output): void {
    if (this._message !== null) {
      OutputStyle.gray(output);
      output.display(this._message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.green(output);
    output = output.write(this._operator);
    OutputStyle.reset(output);
  }
}

/**
 * Generic `Proof` against the validity of an assertion.
 */
export class InvalidProof extends Proof {
  /** @hidden */
  readonly _operator: string;
  /** @hidden */
  readonly _message: string | null;

  constructor(operator: string, message: string | null) {
    super();
    this._operator = operator;
    this._message = message;
  }

  isValid(): boolean {
    return false;
  }

  /**
   * Returns the name of the asserted operator.
   */
  operator(): string {
    return this._operator;
  }

  message(): string | null {
    return this._message;
  }

  display(output: Output): void {
    if (this._message !== null) {
      OutputStyle.gray(output);
      output.display(this._message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.red(output);
    output = output.write(this._operator);
    OutputStyle.reset(output);
  }
}

/**
 * Specific `Proof` against the validity of a binary operator assertion.
 */
export class RefutedProof extends Proof {
  /** @hidden */
  readonly _lhs: unknown;
  /** @hidden */
  readonly _operator: string;
  /** @hidden */
  readonly _rhs: unknown;
  /** @hidden */
  readonly _message: string | null;

  constructor(lhs: unknown, operator: string, rhs: unknown, message: string | null) {
    super();
    this._lhs = lhs;
    this._operator = operator;
    this._rhs = rhs;
    this._message = message;
  }

  isValid(): boolean {
    return false;
  }

  /**
   * Returns the left-hand side of the contradictory expression.
   */
  lhs(): unknown {
    return this._lhs;
  }

  /**
   * Returns the name of the asserted binary operator.
   */
  operator(): string {
    return this._operator;
  }

  /**
   * Returns the right-hand side of the contradictory expression.
   */
  rhs(): unknown {
    return this._rhs;
  }

  message(): string | null {
    return this._message;
  }

  display(output: Output): void {
    if (this._message !== null) {
      OutputStyle.gray(output);
      output.display(this._message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    output.display(this._lhs);

    output = output.write(32/*' '*/);
    OutputStyle.red(output);
    output = output.write(this._operator);
    OutputStyle.reset(output);
    output = output.write(32/*' '*/);

    output.display(this._rhs);
  }
}

/**
 * `Proof` against the validity of an assertion due to an exception.
 */
export class ErrorProof extends Proof {
  /** @hidden */
  readonly _error: unknown;
  /** @hidden */
  readonly _message: string | null;

  constructor(error: unknown, message: string | null) {
    super();
    this._error = error;
    this._message = message;
  }

  isValid(): boolean {
    return false;
  }

  /**
   * Returns the exception that was thrown while evaluating the assertion.
   */
  error(): unknown {
    return this._error;
  }

  message(): string | null {
    return this._message;
  }

  display(output: Output): void {
    if (this._message !== null) {
      OutputStyle.gray(output);
      output.display(this._message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.red(output);
    output = output.write("" + this._error);
    OutputStyle.reset(output);

    const stack = (this._error as any).stack;
    if (typeof stack === "string") {
      output = output.writeln().write(stack);
    }
  }
}

/**
 * Tentative `Proof` for the validity of an assertion that hasn't yet been
 * implemented.
 */
export class PendingProof extends Proof {
  /** @hidden */
  readonly _message: string | null;

  constructor(message: string | null) {
    super();
    this._message = message;
  }

  isValid(): boolean {
    return true;
  }

  isPending(): boolean {
    return true;
  }

  message(): string | null {
    return this._message;
  }

  display(output: Output): void {
    if (this._message !== null) {
      OutputStyle.gray(output);
      output.display(this._message).write(58/*':'*/).write(32/*' '*/);
      OutputStyle.reset(output);
    }

    OutputStyle.yellow(output);
    output = output.write("pending");
    OutputStyle.reset(output);
  }
}
