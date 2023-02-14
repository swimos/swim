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

public class UriWriterTests {

  @Test
  public void writeEmptyURIs() {
    assertEquals("", Uri.empty().toString());
  }

  @Test
  public void writeURIsWithSchemes() {
    assertEquals("scheme:", Uri.schemeName("scheme").toString());
    assertEquals("az09+-.:", Uri.schemeName("az09+-.").toString());
  }

  @Test
  public void writeURIsWithEmptyAuthorities() {
    assertEquals("//", Uri.hostName("").toString());
  }

  @Test
  public void writeURIsWithHostNames() {
    assertEquals("//domain", Uri.hostName("domain").toString());
  }

  @Test
  public void writeURIsWithHostNamesContainingPercentEscapes() {
    assertEquals("//%2f%2f", Uri.hostName("//").toString());
    assertEquals("//a%2fb%2fc", Uri.hostName("a/b/c").toString());
  }

  @Test
  public void writeURIsWithIPv4Addresses() {
    assertEquals("//127.0.0.1", Uri.hostIPv4("127.0.0.1").toString());
    assertEquals("//255.255.255.255", Uri.hostIPv4("255.255.255.255").toString());
  }

  @Test
  public void writeURIsWithIPv6Addresses() {
    assertEquals("//[::1]", Uri.hostIPv6("::1").toString());
  }

  @Test
  public void writeURIsWithHostNamesAndPorts() {
    assertEquals("//domain:80", Uri.hostName("domain").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithIPv4AddressesAndPorts() {
    assertEquals("//127.0.0.1:80", Uri.hostIPv4("127.0.0.1").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithIPv6AddressesAndPorts() {
    assertEquals("//[::1]:80", Uri.hostIPv6("::1").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithPortsButNotHost() {
    assertEquals("//:80", Uri.hostName("").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithEmptyUsers() {
    assertEquals("//@", Uri.userName("").withHostName("").toString());
  }

  @Test
  public void writeURIsWithUsersButNotHosts() {
    assertEquals("//user@", Uri.userName("user").withHostName("").toString());
  }

  @Test
  public void writeURIsWithUserNamesAndPassesButNotHosts() {
    assertEquals("//user:pass@", Uri.userNamePass("user", "pass").withHostName("").toString());
  }

  @Test
  public void writeURIsWithUsersContainingPercentEscapes() {
    assertEquals("//%2f%3a@", Uri.userName("/:").withHostName("").toString());
    assertEquals("//a%2fb%3ac@", Uri.userName("a/b:c").withHostName("").toString());
  }

  @Test
  public void writeURIsWithUserNamesAndPassesContainingPercentEscapes() {
    assertEquals("//%2f%3a:%3a%2f@", Uri.userNamePass("/:", ":/").withHostName("").toString());
    assertEquals("//a%2fb%3ac:d%3ae%2ff@", Uri.userNamePass("a/b:c", "d:e/f").withHostName("").toString());
  }

  @Test
  public void writeURIsWithUsersAndHostNames() {
    assertEquals("//user@domain", Uri.userName("user").withHostName("domain").toString());
  }

  @Test
  public void writeURIsWithUserNamesAndPassesAndHostNames() {
    assertEquals("//user:pass@domain", Uri.userNamePass("user", "pass").withHostName("domain").toString());
  }

  @Test
  public void writeURIsWithUsesAndIPv4Addresses() {
    assertEquals("//user@127.0.0.1", Uri.userName("user").withHostIPv4("127.0.0.1").toString());
  }

  @Test
  public void writeURIsWithUserNamesAndPassesndIPv4Addresses() {
    assertEquals("//user:pass@127.0.0.1", Uri.userNamePass("user", "pass").withHostIPv4("127.0.0.1").toString());
  }

  @Test
  public void writeURIsWithUsersAndIPv6Addresses() {
    assertEquals("//user@[::1]", Uri.userName("user").withHostIPv6("::1").toString());
  }

  @Test
  public void writeURIsWithUserNamesAndPassesAndIPv6Addresses() {
    assertEquals("//user:pass@[::1]", Uri.userNamePass("user", "pass").withHostIPv6("::1").toString());
  }

  @Test
  public void writeURIsWithUsersAndHostNamesAndPorts() {
    assertEquals("//user@domain:80", Uri.userName("user").withHostName("domain").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithUsesAndIPv4AddressesAndPorts() {
    assertEquals("//user@127.0.0.1:80", Uri.userName("user").withHostIPv4("127.0.0.1").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithUsersAndIPv6AddressesAndPorts() {
    assertEquals("//user@[::1]:80", Uri.userName("user").withHostIPv6("::1").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithAbsolutePaths() {
    assertEquals("/", Uri.path("/").toString());
    assertEquals("/one", Uri.path("/", "one").toString());
    assertEquals("/one/", Uri.path("/", "one", "/").toString());
    assertEquals("/one/two", Uri.path("/", "one", "/", "two").toString());
    assertEquals("/one/two/", Uri.path("/", "one", "/", "two", "/").toString());
  }

  @Test
  public void writeURIsWithRelativePaths() {
    assertEquals("one", Uri.path("one").toString());
    assertEquals("one/", Uri.path("one", "/").toString());
    assertEquals("one/two", Uri.path("one", "/", "two").toString());
    assertEquals("one/two/", Uri.path("one", "/", "two", "/").toString());
  }

  @Test
  public void writeURIsWithPathsContainingPermittedDelimeters() {
    assertEquals("/one/!$&()*+,;='/three", Uri.path("/", "one", "/", "!$&()*+,;=\'", "/", "three").toString());
  }

  @Test
  public void writeURIsWithPathsContainingPercentEscapes() {
    assertEquals("/:%2f:", Uri.path("/", ":/:").toString());
    assertEquals("/a:b%2fc:d", Uri.path("/", "a:b/c:d").toString());
    assertEquals("%20", Uri.path(" ").toString());
  }

  @Test
  public void writeURIsWithEmptyQueries() {
    assertEquals("?", Uri.query(null, "").toString());
  }

  @Test
  public void writeURIsWithQueryParts() {
    assertEquals("?query", Uri.query(null, "query").toString());
  }

  @Test
  public void writeURIsWithQueryParams() {
    assertEquals("?key=value", Uri.query("key", "value").toString());
    assertEquals("?k1=v1&k2=v2", Uri.query("k1", "v1", "k2", "v2").toString());
    assertEquals("?k1=v=1", Uri.query("k1", "v=1").toString());
    assertEquals("?k1=", Uri.query("k1", "").toString());
    assertEquals("?=v1", Uri.query("", "v1").toString());
    assertEquals("?=", Uri.query("", "").toString());
    assertEquals("?a&b", Uri.query(null, "a", null, "b").toString());
    assertEquals("?a&a=b&b", Uri.query(null, "a", "a", "b", null, "b").toString());
    assertEquals("?&", Uri.query(null, "", null, "").toString());
  }

  @Test
  public void writeURIsWithQueriesContainingPermittedDelimeters() {
    assertEquals("?!$()*+,/:;?@'", Uri.query(null, "!$()*+,/:;?@'").toString());
  }

  @Test
  public void writeURIsWithQueryPartsContainingPercentEscapes() {
    assertEquals("?a?b?c", Uri.query(null, "a?b?c").toString());
  }

  @Test
  public void writeURIsWithEmptyFragments() {
    assertEquals("#", Uri.fragmentIdentifier("").toString());
  }

  @Test
  public void writeURIsWithFragmentIdentifiers() {
    assertEquals("#fragment", Uri.fragmentIdentifier("fragment").toString());
  }

  @Test
  public void writeURIsWithFragmentsContainingPermittedDelimeters() {
    assertEquals("#!$&()*+,/:;?@='", Uri.fragmentIdentifier("!$&()*+,/:;?@='").toString());
  }

  @Test
  public void writeURIsWithFragmentsContainingPercentEscapes() {
    assertEquals("#%23%23", Uri.fragmentIdentifier("##").toString());
    assertEquals("#a%23b%23c", Uri.fragmentIdentifier("a#b#c").toString());
  }

  @Test
  public void writeURIsWithSchemesAndAuthorities() {
    assertEquals("scheme://domain", Uri.schemeName("scheme").withHostName("domain").toString());
    assertEquals("scheme://domain:80", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).toString());
    assertEquals("scheme://user@domain", Uri.schemeName("scheme").withUserName("user").withHostName("domain").toString());
    assertEquals("scheme://user@domain:80", Uri.schemeName("scheme").withUserName("user").withHostName("domain").withPortNumber(80).toString());
  }

  @Test
  public void writeURIsWithSchemesAndAbsolutePaths() {
    assertEquals("scheme:/", Uri.schemeName("scheme").withPath("/").toString());
    assertEquals("scheme:/one", Uri.schemeName("scheme").withPath("/", "one").toString());
    assertEquals("scheme:/one/", Uri.schemeName("scheme").withPath("/", "one", "/").toString());
    assertEquals("scheme:/one/two", Uri.schemeName("scheme").withPath("/", "one", "/", "two").toString());
    assertEquals("scheme:/one/two/", Uri.schemeName("scheme").withPath("/", "one", "/", "two", "/").toString());
  }

  @Test
  public void writeURIsWithSchemesAndRelativePaths() {
    assertEquals("scheme:one", Uri.schemeName("scheme").withPath("one").toString());
    assertEquals("scheme:one/", Uri.schemeName("scheme").withPath("one", "/").toString());
    assertEquals("scheme:one/two", Uri.schemeName("scheme").withPath("one", "/", "two").toString());
    assertEquals("scheme:one/two/", Uri.schemeName("scheme").withPath("one", "/", "two", "/").toString());
  }

  @Test
  public void writeURIsWithSchemesAndQueries() {
    assertEquals("scheme:?query", Uri.schemeName("scheme").withQuery(null, "query").toString());
    assertEquals("scheme:?key=value", Uri.schemeName("scheme").withQuery("key", "value").toString());
  }

  @Test
  public void writeURIsWithSchemesAndFragments() {
    assertEquals("scheme:#fragment", Uri.schemeName("scheme").withFragmentIdentifier("fragment").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndPaths() {
    assertEquals("scheme://domain/path", Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").toString());
    assertEquals("scheme://domain:80/path", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndQueries() {
    assertEquals("scheme://domain?query", Uri.schemeName("scheme").withHostName("domain").withQuery(null, "query").toString());
    assertEquals("scheme://domain:80?query", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withQuery(null, "query").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesAndFragments() {
    assertEquals("scheme://domain#fragment", Uri.schemeName("scheme").withHostName("domain").withFragmentIdentifier("fragment").toString());
    assertEquals("scheme://domain:80#fragment", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withFragmentIdentifier("fragment").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsAndQueries() {
    assertEquals("scheme://domain/path?query", Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query").toString());
    assertEquals("scheme://domain:80/path?query", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsAndFragments() {
    assertEquals("scheme://domain/path#fragment", Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withFragmentIdentifier("fragment").toString());
    assertEquals("scheme://domain:80/path#fragment", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withFragmentIdentifier("fragment").toString());
  }

  @Test
  public void writeURIsWithSchemesAuthoritiesPathsQueriesAndFragments() {
    assertEquals("scheme://domain/path?query#fragment", Uri.schemeName("scheme").withHostName("domain").withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment").toString());
    assertEquals("scheme://domain:80/path?query#fragment", Uri.schemeName("scheme").withHostName("domain").withPortNumber(80).withPath("/", "path").withQuery(null, "query").withFragmentIdentifier("fragment").toString());
  }

}
