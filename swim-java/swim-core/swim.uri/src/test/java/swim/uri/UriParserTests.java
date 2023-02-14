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

package swim.uri;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class UriParserTests {

  @Test
  public void parseEmptyURIs() {
    assertEquals(Uri.empty(), Uri.parse(""));
  }

  @Test
  public void parseURIsWithSchemes() {
    assertEquals(Uri.schemeName("scheme"), Uri.parse("scheme:"));
    assertEquals(Uri.schemeName("azaz09+-."), Uri.parse("AZaz09+-.:"));
  }

  @Test
  public void parseURIsWithEmptyAuthorities() {
    assertEquals(Uri.hostName(""), Uri.parse("//"));
  }

  @Test
  public void parseURIsWithHostNames() {
    assertEquals(Uri.hostName("domain"), Uri.parse("//domain"));
  }

  @Test
  public void parseURIsWithHostNamesContainingPercentEscapes() {
    assertEquals(Uri.hostName("//"), Uri.parse("//%2f%2f"));
    assertEquals(Uri.hostName("a/b/c"), Uri.parse("//a%2fb%2fc"));
  }

  @Test
  public void parseURIsWithIPv4Addresses() {
    assertEquals(Uri.hostIPv4("127.0.0.1"), Uri.parse("//127.0.0.1"));
    assertEquals(Uri.hostIPv4("255.255.255.255"), Uri.parse("//255.255.255.255"));
  }

  @Test
  public void parseURIsWithIPv6Addresses() {
    assertEquals(Uri.hostIPv6("::1"), Uri.parse("//[::1]"));
  }

  @Test
  public void parseURIsWithHostNamesAndPorts() {
    assertEquals(Uri.hostName("domain").withPortNumber(80), Uri.parse("//domain:80"));
  }

  @Test
  public void parseURIsWithIPv4AddressesAndPorts() {
    assertEquals(Uri.hostIPv4("127.0.0.1").withPortNumber(80), Uri.parse("//127.0.0.1:80"));
  }

  @Test
  public void parseURIsWithIPv6AddressesAndPorts() {
    assertEquals(Uri.hostIPv6("::1").withPortNumber(80), Uri.parse("//[::1]:80"));
  }

  @Test
  public void parseURIsWithPortsButNotHost() {
    assertEquals(Uri.hostName("").withPortNumber(80), Uri.parse("//:80"));
  }

  @Test
  public void parseURIsWithEmptyPorts() {
    assertEquals(Uri.hostName("").withPortNumber(0), Uri.parse("//:"));
  }

  @Test
  public void parseURIsWithEmptyUsers() {
    assertEquals(Uri.userName("").withHostName(""), Uri.parse("//@"));
  }

  @Test
  public void parseURIsWithEmptyUsersAndPorts() {
    assertEquals(Uri.userName("").withHostName("").withPortNumber(0), Uri.parse("//@:"));
  }

  @Test
  public void parseURIsWithUsersButNotHosts() {
    assertEquals(Uri.userName("user").withHostName(""), Uri.parse("//user@"));
  }

  @Test
  public void parseURIsWithUserNamesAndPassesButNotHosts() {
    assertEquals(Uri.userNamePass("user", "pass").withHostName(""), Uri.parse("//user:pass@"));
  }

  @Test
  public void parseURIsWithUsersContainingPercentEscapes() {
    assertEquals(Uri.userName("/:").withHostName(""), Uri.parse("//%2f%3a@"));
    assertEquals(Uri.userName("a/b:c").withHostName(""), Uri.parse("//a%2fb%3ac@"));
  }

  @Test
  public void parseURIsWithUserNamesAndPassesContainingPercentEscapes() {
    assertEquals(Uri.userNamePass("/:", ":/").withHostName(""), Uri.parse("//%2f%3a:%3a%2f@"));
    assertEquals(Uri.userNamePass("a/b:c", "d:e/f").withHostName(""), Uri.parse("//a%2fb%3ac:d%3ae%2ff@"));
  }

  @Test
  public void parseURIsWithUsersAndHostNames() {
    assertEquals(Uri.userName("user").withHostName("domain"), Uri.parse("//user@domain"));
  }

  @Test
  public void parseURIsWithUserNamesAndPassesAndHostNames() {
    assertEquals(Uri.userNamePass("user", "pass").withHostName("domain"), Uri.parse("//user:pass@domain"));
  }

  @Test
  public void parseURIsWithUsesAndIPv4Addresses() {
    assertEquals(Uri.userName("user").withHostIPv4("127.0.0.1"), Uri.parse("//user@127.0.0.1"));
  }

  @Test
  public void parseURIsWithUserNamesAndPassesndIPv4Addresses() {
    assertEquals(Uri.userNamePass("user", "pass").withHostIPv4("127.0.0.1"), Uri.parse("//user:pass@127.0.0.1"));
  }

  @Test
  public void parseURIsWithUsersAndIPv6Addresses() {
    assertEquals(Uri.userName("user").withHostIPv6("::1"), Uri.parse("//user@[::1]"));
  }

  @Test
  public void parseURIsWithUserNamesAndPassesAndIPv6Addresses() {
    assertEquals(Uri.userNamePass("user", "pass").withHostIPv6("::1"), Uri.parse("//user:pass@[::1]"));
  }

  @Test
  public void parseURIsWithUsersAndHostNamesAndPorts() {
    assertEquals(Uri.userName("user").withHostName("domain").withPortNumber(80), Uri.parse("//user@domain:80"));
  }

  @Test
  public void parseURIsWithUsesAndIPv4AddressesAndPorts() {
    assertEquals(Uri.userName("user").withHostIPv4("127.0.0.1").withPortNumber(80), Uri.parse("//user@127.0.0.1:80"));
  }

  @Test
  public void parseURIsWithUsersAndIPv6AddressesAndPorts() {
    assertEquals(Uri.userName("user").withHostIPv6("::1").withPortNumber(80), Uri.parse("//user@[::1]:80"));
  }

  @Test
  public void parseURIsWithAbsolutePaths() {
    assertEquals(Uri.path("/"), Uri.parse("/"));
    assertEquals(Uri.path("/", "one"), Uri.parse("/one"));
    assertEquals(Uri.path("/", "one", "/"), Uri.parse("/one/"));
    assertEquals(Uri.path("/", "one", "/", "two"), Uri.parse("/one/two"));
    assertEquals(Uri.path("/", "one", "/", "two", "/"), Uri.parse("/one/two/"));
  }

  @Test
  public void parseURIsWithRelativePaths() {
    assertEquals(Uri.path("one"), Uri.parse("one"));
    assertEquals(Uri.path("one", "/"), Uri.parse("one/"));
    assertEquals(Uri.path("one", "/", "two"), Uri.parse("one/two"));
    assertEquals(Uri.path("one", "/", "two", "/"), Uri.parse("one/two/"));
  }

  @Test
  public void parseURIsWithPathsContainingPermittedDelimeters() {
    assertEquals(Uri.path("/", "one", "/", "!$&()*+,;=\'", "/", "three"), Uri.parse("/one/!$&()*+,;='/three"));
  }

  @Test
  public void parseURIsWithPathsContainingPercentEscapes() {
    assertEquals(Uri.path("/", ":/:"), Uri.parse("/%3a%2f%3a"));
    assertEquals(Uri.path("/", "a:b/c:d"), Uri.parse("/a%3ab%2fc%3ad"));
    assertEquals(Uri.path(" "), Uri.parse("%20"));
  }

  @Test
  public void parseURIsWithEmptyQueries() {
    assertEquals(Uri.query(null, ""), Uri.parse("?"));
  }

  @Test
  public void parseURIsWithQueryParts() {
    assertEquals(Uri.query(null, "query"), Uri.parse("?query"));
  }

  @Test
  public void parseURIsWithQueryParams() {
    assertEquals(Uri.query("key", "value"), Uri.parse("?key=value"));
    assertEquals(Uri.query("k1", "v1", "k2", "v2"), Uri.parse("?k1=v1&k2=v2"));
    assertEquals(Uri.query("k1", "v=1"), Uri.parse("?k1=v=1"));
    assertEquals(Uri.query("k1", ""), Uri.parse("?k1="));
    assertEquals(Uri.query("", "v1"), Uri.parse("?=v1"));
    assertEquals(Uri.query("", ""), Uri.parse("?="));
    assertEquals(Uri.query(null, "a", null, "b"), Uri.parse("?a&b"));
    assertEquals(Uri.query(null, "a", "a", "b", null, "b"), Uri.parse("?a&a=b&b"));
    assertEquals(Uri.query(null, "", null, ""), Uri.parse("?&"));
  }

  @Test
  public void parseURIsWithQueriesContainingPermittedDelimeters() {
    assertEquals(Uri.query(null, "!$()*+,/:;?@'"), Uri.parse("?!$()*+,/:;?@'"));
  }

  @Test
  public void parseURIsWithQueryPartsContainingPercentEscapes() {
    assertEquals(Uri.query(null, "??"), Uri.parse("?%3f%3f"));
    assertEquals(Uri.query(null, "a?b?c"), Uri.parse("?a%3fb%3fc"));
  }

  @Test
  public void parseURIsWithEmptyFragments() {
    assertEquals(Uri.fragmentIdentifier(""), Uri.parse("#"));
  }

  @Test
  public void parseURIsWithFragmentIdentifiers() {
    assertEquals(Uri.fragmentIdentifier("fragment"), Uri.parse("#fragment"));
  }

  @Test
  public void parseURIsWithFragmentsContainingPermittedDelimeters() {
    assertEquals(Uri.fragmentIdentifier("!$&()*+,/:;?@='"), Uri.parse("#!$&()*+,/:;?@='"));
  }

  @Test
  public void parseURIsWithFragmentsContainingPercentEscapes() {
    assertEquals(Uri.fragmentIdentifier("##"), Uri.parse("#%23%23"));
    assertEquals(Uri.fragmentIdentifier("a#b#c"), Uri.parse("#a%23b%23c"));
  }

  @Test
  public void parseURIsWithSchemesAndAuthorities() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain"), Uri.parse("scheme://domain"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80), Uri.parse("scheme://domain:80"));
    assertEquals(Uri.schemeName("scheme").withUserName("user").withHostName("domain"), Uri.parse("scheme://user@domain"));
    assertEquals(Uri.schemeName("scheme").withUserName("user").withHostName("domain").withPortNumber(80), Uri.parse("scheme://user@domain:80"));
  }

  @Test
  public void parseURIsWithSchemesAndAbsolutePaths() {
    assertEquals(Uri.schemeName("scheme").withPath("/"), Uri.parse("scheme:/"));
    assertEquals(Uri.schemeName("scheme").withPath("/", "one"), Uri.parse("scheme:/one"));
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/"), Uri.parse("scheme:/one/"));
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/", "two"), Uri.parse("scheme:/one/two"));
    assertEquals(Uri.schemeName("scheme").withPath("/", "one", "/", "two", "/"), Uri.parse("scheme:/one/two/"));
  }

  @Test
  public void parseURIsWithSchemesAndRelativePaths() {
    assertEquals(Uri.schemeName("scheme").withPath("one"), Uri.parse("scheme:one"));
    assertEquals(Uri.schemeName("scheme").withPath("one", "/"), Uri.parse("scheme:one/"));
    assertEquals(Uri.schemeName("scheme").withPath("one", "/", "two"), Uri.parse("scheme:one/two"));
    assertEquals(Uri.schemeName("scheme").withPath("one", "/", "two", "/"), Uri.parse("scheme:one/two/"));
  }

  @Test
  public void parseURIsWithSchemesAndQueries() {
    assertEquals(Uri.schemeName("scheme").withQuery(null, "query"), Uri.parse("scheme:?query"));
    assertEquals(Uri.schemeName("scheme").withQuery("key", "value"), Uri.parse("scheme:?key=value"));
  }

  @Test
  public void parseURIsWithSchemesAndFragments() {
    assertEquals(Uri.schemeName("scheme").withFragmentIdentifier("fragment"), Uri.parse("scheme:#fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndPaths() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path"), Uri.parse("scheme://domain/path"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path"), Uri.parse("scheme://domain:80/path"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndQueries() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withQuery(null, "query"), Uri.parse("scheme://domain?query"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withQuery(null, "query"), Uri.parse("scheme://domain:80?query"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndFragments() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withFragmentIdentifier("fragment"), Uri.parse("scheme://domain#fragment"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withFragmentIdentifier("fragment"), Uri.parse("scheme://domain:80#fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndQueries() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query"), Uri.parse("scheme://domain/path?query"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query"), Uri.parse("scheme://domain:80/path?query"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndFragments() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withFragmentIdentifier("fragment"), Uri.parse("scheme://domain/path#fragment"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withFragmentIdentifier("fragment"), Uri.parse("scheme://domain:80/path#fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsQueriesAndFragments() {
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment"), Uri.parse("scheme://domain/path?query#fragment"));
    assertEquals(Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment"), Uri.parse("scheme://domain:80/path?query#fragment"));
  }

}
