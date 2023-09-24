// Copyright 2015-2023 Nstream, inc.
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

package swim.uri;

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UriParserTests {

  @Test
  public void parseEmptyURIs() throws ParseException {
    assertEquals(Uri.empty(),
                 Uri.parse("").getNonNull());
  }

  @Test
  public void parseURIsWithSchemes() throws ParseException {
    assertEquals(Uri.schemeName("scheme"),
                 Uri.parse("scheme:").getNonNull());
    assertEquals(Uri.schemeName("azaz09+-."),
                 Uri.parse("AZaz09+-.:").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyAuthorities() throws ParseException {
    assertEquals(Uri.hostName(""),
                 Uri.parse("//").getNonNull());
  }

  @Test
  public void parseURIsWithHostNames() throws ParseException {
    assertEquals(Uri.hostName("domain"),
                 Uri.parse("//domain").getNonNull());
  }

  @Test
  public void parseURIsWithHostNamesContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.hostName("//"),
                 Uri.parse("//%2f%2f").getNonNull());
    assertEquals(Uri.hostName("a/b/c"),
                 Uri.parse("//a%2fb%2fc").getNonNull());
  }

  @Test
  public void parseURIsWithIPv4Addresses() throws ParseException {
    assertEquals(Uri.hostIPv4("127.0.0.1"),
                 Uri.parse("//127.0.0.1").getNonNull());
    assertEquals(Uri.hostIPv4("255.255.255.255"),
                 Uri.parse("//255.255.255.255").getNonNull());
  }

  @Test
  public void parseURIsWithIPv6Addresses() throws ParseException {
    assertEquals(Uri.hostIPv6("::1"),
                 Uri.parse("//[::1]").getNonNull());
  }

  @Test
  public void parseURIsWithHostNamesAndPorts() throws ParseException {
    assertEquals(Uri.hostName("domain").withPortNumber(80),
                 Uri.parse("//domain:80").getNonNull());
  }

  @Test
  public void parseURIsWithIPv4AddressesAndPorts() throws ParseException {
    assertEquals(Uri.hostIPv4("127.0.0.1").withPortNumber(80),
                 Uri.parse("//127.0.0.1:80").getNonNull());
  }

  @Test
  public void parseURIsWithIPv6AddressesAndPorts() throws ParseException {
    assertEquals(Uri.hostIPv6("::1").withPortNumber(80),
                 Uri.parse("//[::1]:80").getNonNull());
  }

  @Test
  public void parseURIsWithPortsButNotHost() throws ParseException {
    assertEquals(Uri.hostName("").withPortNumber(80),
                 Uri.parse("//:80").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyPorts() throws ParseException {
    assertEquals(Uri.hostName("").withPortNumber(0),
                 Uri.parse("//:").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyUsers() throws ParseException {
    assertEquals(Uri.userName("").withHostName(""),
                 Uri.parse("//@").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyUsersAndPorts() throws ParseException {
    assertEquals(Uri.userName("").withHostName("").withPortNumber(0),
                 Uri.parse("//@:").getNonNull());
  }

  @Test
  public void parseURIsWithUsersButNotHosts() throws ParseException {
    assertEquals(Uri.userName("user").withHostName(""),
                 Uri.parse("//user@").getNonNull());
  }

  @Test
  public void parseURIsWithUserNamesAndPassesButNotHosts() throws ParseException {
    assertEquals(Uri.userNamePass("user", "pass").withHostName(""),
                 Uri.parse("//user:pass@").getNonNull());
  }

  @Test
  public void parseURIsWithUsersContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.userName("/:").withHostName(""),
                 Uri.parse("//%2f%3a@").getNonNull());
    assertEquals(Uri.userName("a/b:c").withHostName(""),
                 Uri.parse("//a%2fb%3ac@").getNonNull());
  }

  @Test
  public void parseURIsWithUserNamesAndPassesContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.userNamePass("/:", ":/").withHostName(""),
                 Uri.parse("//%2f%3a:%3a%2f@").getNonNull());
    assertEquals(Uri.userNamePass("a/b:c", "d:e/f").withHostName(""),
                 Uri.parse("//a%2fb%3ac:d%3ae%2ff@").getNonNull());
  }

  @Test
  public void parseURIsWithUsersAndHostNames() throws ParseException {
    assertEquals(Uri.userName("user").withHostName("domain"),
                 Uri.parse("//user@domain").getNonNull());
  }

  @Test
  public void parseURIsWithUserNamesAndPassesAndHostNames() throws ParseException {
    assertEquals(Uri.userNamePass("user", "pass").withHostName("domain"),
                 Uri.parse("//user:pass@domain").getNonNull());
  }

  @Test
  public void parseURIsWithUsesAndIPv4Addresses() throws ParseException {
    assertEquals(Uri.userName("user").withHostIPv4("127.0.0.1"),
                 Uri.parse("//user@127.0.0.1").getNonNull());
  }

  @Test
  public void parseURIsWithUserNamesAndPassesndIPv4Addresses() throws ParseException {
    assertEquals(Uri.userNamePass("user", "pass").withHostIPv4("127.0.0.1"),
                 Uri.parse("//user:pass@127.0.0.1").getNonNull());
  }

  @Test
  public void parseURIsWithUsersAndIPv6Addresses() throws ParseException {
    assertEquals(Uri.userName("user").withHostIPv6("::1"),
                 Uri.parse("//user@[::1]").getNonNull());
  }

  @Test
  public void parseURIsWithUserNamesAndPassesAndIPv6Addresses() throws ParseException {
    assertEquals(Uri.userNamePass("user", "pass").withHostIPv6("::1"),
                 Uri.parse("//user:pass@[::1]").getNonNull());
  }

  @Test
  public void parseURIsWithUsersAndHostNamesAndPorts() throws ParseException {
    assertEquals(Uri.userName("user").withHostName("domain").withPortNumber(80),
                 Uri.parse("//user@domain:80").getNonNull());
  }

  @Test
  public void parseURIsWithUsesAndIPv4AddressesAndPorts() throws ParseException {
    assertEquals(Uri.userName("user").withHostIPv4("127.0.0.1").withPortNumber(80),
                 Uri.parse("//user@127.0.0.1:80").getNonNull());
  }

  @Test
  public void parseURIsWithUsersAndIPv6AddressesAndPorts() throws ParseException {
    assertEquals(Uri.userName("user").withHostIPv6("::1").withPortNumber(80),
                 Uri.parse("//user@[::1]:80").getNonNull());
  }

  @Test
  public void parseURIsWithAbsolutePaths() throws ParseException {
    assertEquals(Uri.path("/"),
                 Uri.parse("/").getNonNull());
    assertEquals(Uri.path("/", "one"),
                 Uri.parse("/one").getNonNull());
    assertEquals(Uri.path("/", "one", "/"),
                 Uri.parse("/one/").getNonNull());
    assertEquals(Uri.path("/", "one", "/", "two"),
                 Uri.parse("/one/two").getNonNull());
    assertEquals(Uri.path("/", "one", "/", "two", "/"),
                 Uri.parse("/one/two/").getNonNull());
  }

  @Test
  public void parseURIsWithRelativePaths() throws ParseException {
    assertEquals(Uri.path("one"),
                 Uri.parse("one").getNonNull());
    assertEquals(Uri.path("one", "/"),
                 Uri.parse("one/").getNonNull());
    assertEquals(Uri.path("one", "/", "two"),
                 Uri.parse("one/two").getNonNull());
    assertEquals(Uri.path("one", "/", "two", "/"),
                 Uri.parse("one/two/").getNonNull());
  }

  @Test
  public void parseURIsWithPathsContainingPermittedDelimeters() throws ParseException {
    assertEquals(Uri.path("/", "one", "/", "!$&()*+,;=\'", "/", "three"),
                 Uri.parse("/one/!$&()*+,;='/three").getNonNull());
  }

  @Test
  public void parseURIsWithPathsContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.path("/", ":/:"),
                 Uri.parse("/%3a%2f%3a").getNonNull());
    assertEquals(Uri.path("/", "a:b/c:d"),
                 Uri.parse("/a%3ab%2fc%3ad").getNonNull());
    assertEquals(Uri.path(" "),
                 Uri.parse("%20").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyQueries() throws ParseException {
    assertEquals(Uri.query(null, ""),
                 Uri.parse("?").getNonNull());
  }

  @Test
  public void parseURIsWithQueryParts() throws ParseException {
    assertEquals(Uri.query(null, "query"),
                 Uri.parse("?query").getNonNull());
  }

  @Test
  public void parseURIsWithQueryParams() throws ParseException {
    assertEquals(Uri.query("key", "value"),
                 Uri.parse("?key=value").getNonNull());
    assertEquals(Uri.query("k1", "v1", "k2", "v2"),
                 Uri.parse("?k1=v1&k2=v2").getNonNull());
    assertEquals(Uri.query("k1", "v=1"),
                 Uri.parse("?k1=v=1").getNonNull());
    assertEquals(Uri.query("k1", ""),
                 Uri.parse("?k1=").getNonNull());
    assertEquals(Uri.query("", "v1"),
                 Uri.parse("?=v1").getNonNull());
    assertEquals(Uri.query("", ""),
                 Uri.parse("?=").getNonNull());
    assertEquals(Uri.query(null, "a", null, "b"),
                 Uri.parse("?a&b").getNonNull());
    assertEquals(Uri.query(null, "a", "a", "b", null, "b"),
                 Uri.parse("?a&a=b&b").getNonNull());
    assertEquals(Uri.query(null, "", null, ""),
                 Uri.parse("?&").getNonNull());
  }

  @Test
  public void parseURIsWithQueriesContainingPermittedDelimeters() throws ParseException {
    assertEquals(Uri.query(null, "!$()*+,/:;?@'"),
                 Uri.parse("?!$()*+,/:;?@'").getNonNull());
  }

  @Test
  public void parseURIsWithQueryPartsContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.query(null, "??"),
                 Uri.parse("?%3f%3f").getNonNull());
    assertEquals(Uri.query(null, "a?b?c"),
                 Uri.parse("?a%3fb%3fc").getNonNull());
  }

  @Test
  public void parseURIsWithEmptyFragments() throws ParseException {
    assertEquals(Uri.fragmentIdentifier(""),
                 Uri.parse("#").getNonNull());
  }

  @Test
  public void parseURIsWithFragmentIdentifiers() throws ParseException {
    assertEquals(Uri.fragmentIdentifier("fragment"),
                 Uri.parse("#fragment").getNonNull());
  }

  @Test
  public void parseURIsWithFragmentsContainingPermittedDelimeters() throws ParseException {
    assertEquals(Uri.fragmentIdentifier("!$&()*+,/:;?@='"),
                 Uri.parse("#!$&()*+,/:;?@='").getNonNull());
  }

  @Test
  public void parseURIsWithFragmentsContainingPercentEscapes() throws ParseException {
    assertEquals(Uri.fragmentIdentifier("##"),
                 Uri.parse("#%23%23").getNonNull());
    assertEquals(Uri.fragmentIdentifier("a#b#c"),
                 Uri.parse("#a%23b%23c").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAndAuthorities() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain"),
                 Uri.parse("scheme://domain").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80),
                 Uri.parse("scheme://domain:80").getNonNull());
    assertEquals(Uri.schemeName("scheme").withUserName("user").withHostName("domain"),
                 Uri.parse("scheme://user@domain").getNonNull());
    assertEquals(Uri.schemeName("scheme").withUserName("user").withHostName("domain").withPortNumber(80),
                 Uri.parse("scheme://user@domain:80").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAndAbsolutePaths() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withPath("/"),
                 Uri.parse("scheme:/").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("/", "one"),
                 Uri.parse("scheme:/one").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/"),
                 Uri.parse("scheme:/one/").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/", "two"),
                 Uri.parse("scheme:/one/two").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/", "two", "/"),
                 Uri.parse("scheme:/one/two/").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAndRelativePaths() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withPath("one"),
                 Uri.parse("scheme:one").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("one", "/"),
                 Uri.parse("scheme:one/").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("one", "/", "two"),
                 Uri.parse("scheme:one/two").getNonNull());
    assertEquals(Uri.schemeName("scheme").withPath("one", "/", "two", "/"),
                 Uri.parse("scheme:one/two/").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAndQueries() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withQuery(null, "query"),
                 Uri.parse("scheme:?query").getNonNull());
    assertEquals(Uri.schemeName("scheme").withQuery("key", "value"),
                 Uri.parse("scheme:?key=value").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAndFragments() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme:#fragment").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndPaths() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path"),
                 Uri.parse("scheme://domain/path").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path"),
                 Uri.parse("scheme://domain:80/path").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndQueries() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withQuery(null, "query"),
                 Uri.parse("scheme://domain?query").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withQuery(null, "query"),
                 Uri.parse("scheme://domain:80?query").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndFragments() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain#fragment").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain:80#fragment").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndQueries() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query"),
                 Uri.parse("scheme://domain/path?query").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query"),
                 Uri.parse("scheme://domain:80/path?query").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndFragments() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain/path#fragment").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain:80/path#fragment").getNonNull());
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsQueriesAndFragments() throws ParseException {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain/path?query#fragment").getNonNull());
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment"),
                 Uri.parse("scheme://domain:80/path?query#fragment").getNonNull());
  }

}
