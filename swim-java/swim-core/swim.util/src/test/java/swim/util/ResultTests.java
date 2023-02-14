// Copyright 2015-2022 Swim.inc
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

package swim.util;

import java.util.NoSuchElementException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ResultTests {

  @Test
  public void emptySameAsNull() {
    assertSame(Result.empty(), Result.success(null));
  }

  @Test
  public void emptyIsSuccess() {
    final Result<String> result = Result.empty();
    assertTrue(result.isSuccess());
  }

  @Test
  public void successIsSuccess() {
    final Result<String> result = Result.success("foo");
    assertTrue(result.isSuccess());
  }

  @Test
  public void failureIsNotSuccess() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertFalse(result.isSuccess());
  }

  @Test
  public void emptyIsNotFailure() {
    final Result<String> result = Result.empty();
    assertFalse(result.isFailure());
  }

  @Test
  public void successIsNotFailure() {
    final Result<String> result = Result.success("foo");
    assertFalse(result.isFailure());
  }

  @Test
  public void failureIsFailure() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertTrue(result.isFailure());
  }

  @Test
  public void emptyGetReturnsNull() {
    final Result<String> result = Result.empty();
    assertNull(result.get());
  }

  @Test
  public void successGetReturnsValue() {
    final Result<String> result = Result.success("foo");
    assertEquals("foo", result.get());
  }

  @Test
  public void failureGetThrows() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertThrows(NoSuchElementException.class, () -> result.get());
  }

  @Test
  public void emptyGetErrorThrows() {
    final Result<String> result = Result.empty();
    assertThrows(NoSuchElementException.class, () -> result.getError());
  }

  @Test
  public void successGetErrorThrows() {
    final Result<String> result = Result.success("foo");
    assertThrows(NoSuchElementException.class, () -> result.getError());
  }

  @Test
  public void failureGetErrorReturnsError() {
    final RuntimeException error = new RuntimeException();
    final Result<String> result = Result.failure(error);
    assertSame(error, result.getError());
  }

  @Test
  public void successGetOrReturnsValue() {
    final Result<String> result = Result.success("foo");
    assertEquals("foo", result.getOr("bar"));
  }

  @Test
  public void failureGetOrReturnsOther() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertEquals("bar", result.getOr("bar"));
  }

  @Test
  public void successGetOrElseReturnsValue() {
    final Result<String> result = Result.success("foo");
    assertEquals("foo", result.getOrElse(() -> "bar"));
  }

  @Test
  public void failureGetOrElseReturnsOther() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertEquals("bar", result.getOrElse(() -> "bar"));
  }

  @Test
  public void emptyContainsNullIsTrue() {
    final Result<String> result = Result.empty();
    assertTrue(result.contains(null));
  }

  @Test
  public void emptyContainsOtherValueIsFalse() {
    final Result<String> result = Result.empty();
    assertFalse(result.contains("foo"));
  }

  @Test
  public void successContainsValueIsTrue() {
    final Result<String> result = Result.success("foo");
    assertTrue(result.contains("foo"));
  }

  @Test
  public void successContainOtherValueIsFalse() {
    final Result<String> result = Result.success("foo");
    assertFalse(result.contains("bar"));
  }

  @Test
  public void successContainsNullIsFalse() {
    final Result<String> result = Result.success("foo");
    assertFalse(result.contains(null));
  }

  @Test
  public void failureContainsErrorIsFalse() {
    final RuntimeException error = new RuntimeException();
    final Result<String> result = Result.failure(error);
    assertFalse(result.contains(error));
  }

  @Test
  public void failuresContainValueIsFalse() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertFalse(result.contains("foo"));
  }

  @Test
  public void failureContainsNullIsFalse() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertFalse(result.contains(null));
  }

  @Test
  public void successMapToSuccess() {
    final Result<Integer> result = Result.success(1);
    assertEquals(Result.success("1"), result.map(value -> value.toString()));
  }

  @Test
  public void successMapNonFatalThrowsToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.success(1);
    assertEquals(Result.failure(error), result.map(value -> { throw error; }));
  }

  @Test
  public void successMapFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.success(1);
    assertThrows(error.getClass(), () -> result.map(value -> { throw error; }));
  }

  @Test
  public void failureMapToSelf() {
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertSame(result, result.map(value -> value.toString()));
  }

  @Test
  public void successFlatMapToSuccess() {
    final Result<Integer> result = Result.success(1);
    final Result<String> success = Result.success("1");
    assertEquals(success, result.flatMap(value -> success));
  }

  @Test
  public void successFlatMapToFailure() {
    final Result<Integer> result = Result.success(1);
    final Result<String> failure = Result.failure(new RuntimeException());
    assertEquals(failure, result.flatMap(value -> failure));
  }

  @Test
  public void successFlatMapNonFatalThrowsToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.success(1);
    assertEquals(Result.failure(error), result.flatMap(value -> { throw error; }));
  }

  @Test
  public void successFlatMapFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.success(1);
    assertThrows(error.getClass(), () -> result.flatMap(value -> { throw error; }));
  }

  @Test
  public void failureFlatMapToSelf() {
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertSame(result, result.flatMap(value -> Result.success(value.toString())));
  }

  @Test
  public void successMapFailureToSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.mapFailure(error -> error));
  }

  @Test
  public void failureMapFailureToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<String> result = Result.failure(error);
    final RuntimeException newError = new RuntimeException(error);
    assertEquals(Result.failure(newError), result.mapFailure(oldError -> newError));
  }

  @Test
  public void failureMapFailureNonFatalThrowsToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertEquals(Result.failure(error), result.mapFailure(value -> { throw error; }));
  }

  @Test
  public void failureMapFailureFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertThrows(error.getClass(), () -> result.mapFailure(value -> { throw error; }));
  }

  @Test
  public void successRecoverToSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.recover(error -> "bar"));
  }

  @Test
  public void failureRecoverToSuccess() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertEquals(Result.success("foo"), result.recover(error -> "foo"));
  }

  @Test
  public void failureRecoverNonFatalThrowsToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertEquals(Result.failure(error), result.recover(value -> { throw error; }));
  }

  @Test
  public void failureRecoverFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertThrows(error.getClass(), () -> result.recover(value -> { throw error; }));
  }

  @Test
  public void successRecoverWithToSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.recoverWith(error -> Result.success("bar")));
  }

  @Test
  public void failureRecoverWithSuccess() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> success = Result.success("foo");
    assertSame(success, result.recoverWith(error -> success));
  }

  @Test
  public void failureRecoverWithFailure() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> failure = Result.failure(new RuntimeException());
    assertSame(failure, result.recoverWith(error -> failure));
  }

  @Test
  public void failureRecoverWithNonFatalThrowsToFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertEquals(Result.failure(error), result.recoverWith(value -> { throw error; }));
  }

  @Test
  public void failureRecoverWithFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertThrows(error.getClass(), () -> result.recoverWith(value -> { throw error; }));
  }

  @Test
  public void successOrSuccessReturnsSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.or(Result.success("bar")));
  }

  @Test
  public void successOrFailureReturnsSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.or(Result.failure(new RuntimeException())));
  }

  @Test
  public void failureOrSuccessReturnsSuccess() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> success = Result.success("bar");
    assertSame(success, result.or(success));
  }

  @Test
  public void failureOrFailureReturnsFaulre() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> failure = Result.failure(new RuntimeException());
    assertSame(failure, result.or(failure));
  }

  @Test
  public void successOrElseSuccessReturnsSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.orElse(() -> Result.success("bar")));
  }

  @Test
  public void successOrElseFailureReturnsSelf() {
    final Result<String> result = Result.success("foo");
    assertSame(result, result.orElse(() -> Result.failure(new RuntimeException())));
  }

  @Test
  public void failureOrElseSuccessReturnsSuccess() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> success = Result.success("bar");
    assertSame(success, result.orElse(() -> success));
  }

  @Test
  public void failureOrElseFailureReturnsFaulre() {
    final Result<String> result = Result.failure(new RuntimeException());
    final Result<String> failure = Result.failure(new RuntimeException());
    assertSame(failure, result.orElse(() -> failure));
  }

  @Test
  public void failureOrElseNonFatalThrowsReturnsFailure() {
    final RuntimeException error = new RuntimeException();
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertEquals(Result.failure(error), result.orElse(() -> { throw error; }));
  }

  @Test
  public void failureOrElseFatalThrowsPropagate() {
    final UnknownError error = new UnknownError() { };
    final Result<Integer> result = Result.failure(new RuntimeException());
    assertThrows(error.getClass(), () -> result.orElse(() -> { throw error; }));
  }

  @Test
  public void successAsFailureIsFailure() {
    final Result<String> result = Result.success("foo");
    assertInstanceOf(IllegalStateException.class, result.asFailure().getError());
  }

  @Test
  public void failureAsFailureIsSelf() {
    final Result<String> result = Result.failure(new RuntimeException());
    assertSame(result, result.asFailure());
  }

  @Test
  public void resultOfSuccess() {
    assertEquals(Result.success("foo"), Result.of(() -> "foo"));
  }

  @Test
  public void resultOfFailure() {
    final RuntimeException error = new RuntimeException();
    assertEquals(Result.failure(error), Result.of(() -> { throw error; }));
  }

}
