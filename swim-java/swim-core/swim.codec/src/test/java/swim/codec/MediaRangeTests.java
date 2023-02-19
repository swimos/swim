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

package swim.codec;

import org.junit.jupiter.api.Test;

public class MediaRangeTests {

  @Test
  public void parseMediaRanges() {
    assertParses(MediaRange.of("*", "*"), "*/*");
    assertParses(MediaRange.of("text", "*"), "text/*");
    assertParses(MediaRange.of("text", "plain"), "text/plain");
  }

  @Test
  public void writeMediaRanges() {
    assertWrites("*/*", MediaRange.of("*", "*"));
    assertWrites("text/*", MediaRange.of("text", "*"));
    assertWrites("text/plain", MediaRange.of("text", "plain"));
  }

  @Test
  public void parseMediaRangesWithParams() {
    assertParses(MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8"),
                 "text/*;charset=UTF-8");
    assertParses(MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8"),
                 "text/* ; charset=UTF-8");
  }

  @Test
  public void writeMediaRangesWithParams() {
    assertWrites("text/*; charset=UTF-8",
                 MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8"));
  }

  @Test
  public void parseMediaRangesWithQuotedParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("format", "pretty print"),
                 "application/*;format=\"pretty print\"");
    assertParses(MediaRange.of("application", "*")
                           .withParam("format", "pretty print"),
                 "application/* ; format=\"pretty print\"");
  }

  @Test
  public void writeMediaRangesWithQuotedParams() {
    assertWrites("application/*; format=\"pretty print\"",
                 MediaRange.of("application", "*")
                           .withParam("format", "pretty print"));
  }

  @Test
  public void parseMediaRangesWithMultipleParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print"),
                 "application/*;charset=UTF-8;format=\"pretty print\"");
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print"),
                 "application/* ; charset=UTF-8 ; format=\"pretty print\"");
  }

  @Test
  public void writeMediaRangesWithMultipleParams() {
    assertWrites("application/*; charset=UTF-8; format=\"pretty print\"",
                 MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print"));
  }

  @Test
  public void parseMediaRangesWithWeights() {
    assertParses(MediaRange.of("text", "*").withWeight(0), "text/* ; q=0");
    assertParses(MediaRange.of("text", "*").withWeight(0), "text/*;q=0");
    assertParses(MediaRange.of("text", "*").withWeight(0), "text/*;q=0.0");
    assertParses(MediaRange.of("text", "*").withWeight(0), "text/*;q=0.00");
    assertParses(MediaRange.of("text", "*").withWeight(0), "text/*;q=0.000");
    assertParses(MediaRange.of("text", "*").withWeight(1), "text/*;q=0.001");
    assertParses(MediaRange.of("text", "*").withWeight(10), "text/*;q=0.01");
    assertParses(MediaRange.of("text", "*").withWeight(10), "text/*;q=0.010");
    assertParses(MediaRange.of("text", "*").withWeight(100), "text/*;q=0.1");
    assertParses(MediaRange.of("text", "*").withWeight(100), "text/*;q=0.10");
    assertParses(MediaRange.of("text", "*").withWeight(100), "text/*;q=0.100");
    assertParses(MediaRange.of("text", "*").withWeight(500), "text/*;q=0.5");
    assertParses(MediaRange.of("text", "*").withWeight(500), "text/*;q=0.50");
    assertParses(MediaRange.of("text", "*").withWeight(500), "text/*;q=0.500");
    assertParses(MediaRange.of("text", "*").withWeight(900), "text/*;q=0.9");
    assertParses(MediaRange.of("text", "*").withWeight(900), "text/*;q=0.90");
    assertParses(MediaRange.of("text", "*").withWeight(900), "text/*;q=0.900");
    assertParses(MediaRange.of("text", "*").withWeight(990), "text/*;q=0.99");
    assertParses(MediaRange.of("text", "*").withWeight(990), "text/*;q=0.990");
    assertParses(MediaRange.of("text", "*").withWeight(999), "text/*;q=0.999");
    assertParses(MediaRange.of("text", "*").withWeight(1000), "text/*;q=1");
    assertParses(MediaRange.of("text", "*").withWeight(1000), "text/*;q=1.0");
    assertParses(MediaRange.of("text", "*").withWeight(1000), "text/*;q=1.00");
    assertParses(MediaRange.of("text", "*").withWeight(1000), "text/*;q=1.000");
  }

  @Test
  public void writeMediaRangesWithWeights() {
    assertWrites("text/*; q=0", MediaRange.of("text", "*").withWeight(0));
    assertWrites("text/*; q=0.001", MediaRange.of("text", "*").withWeight(1));
    assertWrites("text/*; q=0.01", MediaRange.of("text", "*").withWeight(10));
    assertWrites("text/*; q=0.1", MediaRange.of("text", "*").withWeight(100));
    assertWrites("text/*; q=0.5", MediaRange.of("text", "*").withWeight(500));
    assertWrites("text/*; q=0.9", MediaRange.of("text", "*").withWeight(900));
    assertWrites("text/*; q=0.99", MediaRange.of("text", "*").withWeight(990));
    assertWrites("text/*; q=0.999", MediaRange.of("text", "*").withWeight(999));
    assertWrites("text/*", MediaRange.of("text", "*").withWeight(1000));
  }

  @Test
  public void parseMediaRangesWithExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withExtParam("rate", "1s"),
                 "application/*;q=1;rate=1s");
  }

  @Test
  public void writeMediaRangesWithExtParams() {
    assertWrites("application/*; q=1; rate=1s",
                 MediaRange.of("application", "*")
                           .withExtParam("rate", "1s"));
  }

  @Test
  public void parseMediaRangesWithQuotedExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withExtParam("limit", "no limit"),
                 "application/*;q=1;limit=\"no limit\"");
  }

  @Test
  public void writeMediaRangesWithQuotedExtParams() {
    assertWrites("application/*; q=1; limit=\"no limit\"",
                 MediaRange.of("application", "*")
                           .withExtParam("limit", "no limit"));
  }

  @Test
  public void parseMediaRangesWithMultipleExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"),
                 "application/*;q=1;rate=1s;limit=\"no limit\"");
  }

  @Test
  public void writeMediaRangesWithMultipleExtParams() {
    assertWrites("application/*; q=1; rate=1s; limit=\"no limit\"",
                 MediaRange.of("application", "*")
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"));
  }

  @Test
  public void parseMediaRangesWithParamsAndWeights() {
    assertParses(MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8")
                           .withWeight(500),
                 "text/*;charset=UTF-8;q=0.5");
    assertParses(MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8")
                           .withWeight(500),
                 "text/* ; charset=UTF-8; q=0.5");
  }

  @Test
  public void writeMediaRangesWitParamsAndWeights() {
    assertWrites("text/*; charset=UTF-8; q=0.5",
                 MediaRange.of("text", "*")
                           .withParam("charset", "UTF-8")
                           .withWeight(500));
  }

  @Test
  public void parseMediaRangesWithQuotedParamsAndWeights() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("format", "pretty print")
                           .withWeight(500),
                 "application/*;format=\"pretty print\";q=0.5");
    assertParses(MediaRange.of("application", "*")
                           .withParam("format", "pretty print")
                           .withWeight(500),
                 "application/* ; format=\"pretty print\" ; q=0.5");
  }

  @Test
  public void writeMediaRangesWithQuotedParamsAndWeights() {
    assertWrites("application/*; format=\"pretty print\"; q=0.5",
                 MediaRange.of("application", "*")
                           .withParam("format", "pretty print")
                           .withWeight(500));
  }

  @Test
  public void parseMediaRangesWithParamsAndExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withExtParam("rate", "1s"),
                 "application/*;charset=UTF-8;q=1;rate=1s");
  }

  @Test
  public void writeMediaRangesWithParamsAndExtParams() {
    assertWrites("application/*; charset=UTF-8; q=1; rate=1s",
                 MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withExtParam("rate", "1s"));
  }

  @Test
  public void parseMediaRangesWithMultipleParamsAndMultipleExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print")
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"),
                 "application/*;charset=UTF-8;format=\"pretty print\";q=1;rate=1s;limit=\"no limit\"");
  }

  @Test
  public void writeMediaRangesWithMultipleParamsAndMultipleExtParams() {
    assertWrites("application/*; charset=UTF-8; format=\"pretty print\"; q=1; rate=1s; limit=\"no limit\"",
                 MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print")
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"));
  }

  @Test
  public void parseMediaRangesWithParamsAndWeightsAndExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withWeight(500)
                           .withExtParam("rate", "1s"),
                 "application/*;charset=UTF-8;q=0.5;rate=1s");
  }

  @Test
  public void writeMediaRangesWithParamsAndWeightsAndExtParams() {
    assertWrites("application/*; charset=UTF-8; q=0.5; rate=1s",
                 MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withWeight(500)
                           .withExtParam("rate", "1s"));
  }

  @Test
  public void parseMediaRangesWithMultipleParamsAndWeightsAndMultipleExtParams() {
    assertParses(MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print")
                           .withWeight(500)
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"),
                 "application/*;charset=UTF-8;format=\"pretty print\";q=0.5;rate=1s;limit=\"no limit\"");
  }

  @Test
  public void writeMediaRangesWithMultipleParamsAndWeightsAndMultipleExtParams() {
    assertWrites("application/*; charset=UTF-8; format=\"pretty print\"; q=0.5; rate=1s; limit=\"no limit\"",
                 MediaRange.of("application", "*")
                           .withParam("charset", "UTF-8")
                           .withParam("format", "pretty print")
                           .withWeight(500)
                           .withExtParam("rate", "1s")
                           .withExtParam("limit", "no limit"));
  }

  public static void assertParses(MediaRange expected, String string) {
    CodecAssertions.assertParses(MediaRange.parse(), expected, string);
  }

  public static void assertWrites(String expected, MediaRange mediaRange) {
    CodecAssertions.assertWrites(expected, mediaRange::write);
  }

}
