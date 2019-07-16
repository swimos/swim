// Copyright 2015-2019 SWIM.AI inc.
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

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class UriParserSpec {
  @Test
  public void parseEmptyURIs() {
    assertEquals(Uri.parse(""), Uri.empty());
  }

  @Test
  public void parseURIsWithSchemes() {
    assertEquals(Uri.parse("scheme:"), Uri.empty().schemeName("scheme"));
    assertEquals(Uri.parse("AZaz09+-.:"), Uri.empty().schemeName("azaz09+-."));
  }

  @Test
  public void parseURIsWithEmptyAuthorities() {
    assertEquals(Uri.parse("//"), Uri.empty().hostName(""));
  }

  @Test
  public void parseURIsWithHostNames() {
    assertEquals(Uri.parse("//domain"), Uri.empty().hostName("domain"));
  }

  @Test
  public void parseURIsWithHostNamesContainingPercentEscapes() {
    assertEquals(Uri.parse("//%2f%2f"), Uri.empty().hostName("//"));
    assertEquals(Uri.parse("//a%2fb%2fc"), Uri.empty().hostName("a/b/c"));
  }

  @Test
  public void parseURIsWithIPv4Addresses() {
    assertEquals(Uri.parse("//127.0.0.1"), Uri.empty().hostIPv4("127.0.0.1"));
    assertEquals(Uri.parse("//255.255.255.255"), Uri.empty().hostIPv4("255.255.255.255"));
  }

  @Test
  public void parseURIsWithIPv6Addresses() {
    assertEquals(Uri.parse("//[::1]"), Uri.empty().hostIPv6("::1"));
  }

  @Test
  public void parseURIsWithHostNamesAndPorts() {
    assertEquals(Uri.parse("//domain:80"), Uri.empty().hostName("domain").portNumber(80));
  }

  @Test
  public void parseURIsWithIPv4AddressesAndPorts() {
    assertEquals(Uri.parse("//127.0.0.1:80"), Uri.empty().hostIPv4("127.0.0.1").portNumber(80));
  }

  @Test
  public void parseURIsWithIPv6AddressesAndPorts() {
    assertEquals(Uri.parse("//[::1]:80"), Uri.empty().hostIPv6("::1").portNumber(80));
  }

  @Test
  public void parseURIsWithPortsButNotHost() {
    assertEquals(Uri.parse("//:80"), Uri.empty().hostName("").portNumber(80));
  }

  @Test
  public void parseURIsWithEmptyPorts() {
    assertEquals(Uri.parse("//:"), Uri.empty().hostName("").portNumber(0));
  }

  @Test
  public void parseURIsWithEmptyUsers() {
    assertEquals(Uri.parse("//@"), Uri.empty().username("").hostName(""));
  }

  @Test
  public void parseURIsWithEmptyUsersAndPorts() {
    assertEquals(Uri.parse("//@:"), Uri.empty().username("").hostName("").portNumber(0));
  }

  @Test
  public void parseURIsWithUsersButNotHosts() {
    assertEquals(Uri.parse("//user@"), Uri.empty().username("user").hostName(""));
  }

  @Test
  public void parseURIsWithUsernamesAndPasswordsButNotHosts() {
    assertEquals(Uri.parse("//user:pass@"), Uri.empty().username("user", "pass").hostName(""));
  }

  @Test
  public void parseURIsWithUsersContainingPercentEscapes() {
    assertEquals(Uri.parse("//%2f%3a@"), Uri.empty().username("/:").hostName(""));
    assertEquals(Uri.parse("//a%2fb%3ac@"), Uri.empty().username("a/b:c").hostName(""));
  }

  @Test
  public void parseURIsWithUsernamesAndPasswordsContainingPercentEscapes() {
    assertEquals(Uri.parse("//%2f%3a:%3a%2f@"), Uri.empty().username("/:", ":/").hostName(""));
    assertEquals(Uri.parse("//a%2fb%3ac:d%3ae%2ff@"), Uri.empty().username("a/b:c", "d:e/f").hostName(""));
  }

  @Test
  public void parseURIsWithUsersAndHostNames() {
    assertEquals(Uri.parse("//user@domain"), Uri.empty().username("user").hostName("domain"));
  }

  @Test
  public void parseURIsWithUsernamesAndPasswordsAndHostNames() {
    assertEquals(Uri.parse("//user:pass@domain"), Uri.empty().username("user", "pass").hostName("domain"));
  }

  @Test
  public void parseURIsWithUsesAndIPv4Addresses() {
    assertEquals(Uri.parse("//user@127.0.0.1"), Uri.empty().username("user").hostIPv4("127.0.0.1"));
  }

  @Test
  public void parseURIsWithUsernamesAndPasswordsndIPv4Addresses() {
    assertEquals(Uri.parse("//user:pass@127.0.0.1"), Uri.empty().username("user", "pass").hostIPv4("127.0.0.1"));
  }

  @Test
  public void parseURIsWithUsersAndIPv6Addresses() {
    assertEquals(Uri.parse("//user@[::1]"), Uri.empty().username("user").hostIPv6("::1"));
  }

  @Test
  public void parseURIsWithUsernamesAndPasswordsAndIPv6Addresses() {
    assertEquals(Uri.parse("//user:pass@[::1]"), Uri.empty().username("user", "pass").hostIPv6("::1"));
  }

  @Test
  public void parseURIsWithUsersAndHostNamesAndPorts() {
    assertEquals(Uri.parse("//user@domain:80"), Uri.empty().username("user").hostName("domain").portNumber(80));
  }

  @Test
  public void parseURIsWithUsesAndIPv4AddressesAndPorts() {
    assertEquals(Uri.parse("//user@127.0.0.1:80"), Uri.empty().username("user").hostIPv4("127.0.0.1").portNumber(80));
  }

  @Test
  public void parseURIsWithUsersAndIPv6AddressesAndPorts() {
    assertEquals(Uri.parse("//user@[::1]:80"), Uri.empty().username("user").hostIPv6("::1").portNumber(80));
  }

  @Test
  public void parseURIsWithAbsolutePaths() {
    assertEquals(Uri.parse("/"), Uri.empty().path("/"));
    assertEquals(Uri.parse("/one"), Uri.empty().path("/", "one"));
    assertEquals(Uri.parse("/one/"), Uri.empty().path("/", "one", "/"));
    assertEquals(Uri.parse("/one/two"), Uri.empty().path("/", "one", "/", "two"));
    assertEquals(Uri.parse("/one/two/"), Uri.empty().path("/", "one", "/", "two", "/"));
  }

  @Test
  public void parseURIsWithRelativePaths() {
    assertEquals(Uri.parse("one"), Uri.empty().path("one"));
    assertEquals(Uri.parse("one/"), Uri.empty().path("one", "/"));
    assertEquals(Uri.parse("one/two"), Uri.empty().path("one", "/", "two"));
    assertEquals(Uri.parse("one/two/"), Uri.empty().path("one", "/", "two", "/"));
  }

  @Test
  public void parseURIsWithPathsContainingPermittedDelimeters() {
    assertEquals(Uri.parse("/one/!$&()*+,;='/three"), Uri.empty().path("/", "one", "/", "!$&()*+,;=\'", "/", "three"));
  }

  @Test
  public void parseURIsWithPathsContainingPercentEscapes() {
    assertEquals(Uri.parse("/%3a%2f%3a"), Uri.empty().path("/", ":/:"));
    assertEquals(Uri.parse("/a%3ab%2fc%3ad"), Uri.empty().path("/", "a:b/c:d"));
    assertEquals(Uri.parse("%20"), Uri.empty().path(" "));
  }

  @Test
  public void parseURIsWithEmptyQueries() {
    assertEquals(Uri.parse("?"), Uri.empty().query(null, ""));
  }

  @Test
  public void parseURIsWithQueryParts() {
    assertEquals(Uri.parse("?query"), Uri.empty().query(null, "query"));
  }

  @Test
  public void parseURIsWithQueryParams() {
    assertEquals(Uri.parse("?key=value"), Uri.empty().query("key", "value"));
    assertEquals(Uri.parse("?k1=v1&k2=v2"), Uri.empty().query("k1", "v1", "k2", "v2"));
    assertEquals(Uri.parse("?k1=v=1"), Uri.empty().query("k1", "v=1"));
    assertEquals(Uri.parse("?k1="), Uri.empty().query("k1", ""));
    assertEquals(Uri.parse("?=v1"), Uri.empty().query("", "v1"));
    assertEquals(Uri.parse("?="), Uri.empty().query("", ""));
    assertEquals(Uri.parse("?a&b"), Uri.empty().query(null, "a", null, "b"));
    assertEquals(Uri.parse("?a&a=b&b"), Uri.empty().query(null, "a", "a", "b", null, "b"));
    assertEquals(Uri.parse("?&"), Uri.empty().query(null, "", null, ""));
  }

  @Test
  public void parseURIsWithQueriesContainingPermittedDelimeters() {
    assertEquals(Uri.parse("?!$()*+,/:;?@'"), Uri.empty().query(null, "!$()*+,/:;?@'"));
  }

  @Test
  public void parseURIsWithQueryPartsContainingPercentEscapes() {
    assertEquals(Uri.parse("?%3f%3f"), Uri.empty().query(null, "??"));
    assertEquals(Uri.parse("?a%3fb%3fc"), Uri.empty().query(null, "a?b?c"));
  }

  @Test
  public void parseURIsWithEmptyFragments() {
    assertEquals(Uri.parse("#"), Uri.empty().fragmentIdentifier(""));
  }

  @Test
  public void parseURIsWithFragmentIdentifiers() {
    assertEquals(Uri.parse("#fragment"), Uri.empty().fragmentIdentifier("fragment"));
  }

  @Test
  public void parseURIsWithFragmentsContainingPermittedDelimeters() {
    assertEquals(Uri.parse("#!$&()*+,/:;?@='"), Uri.empty().fragmentIdentifier("!$&()*+,/:;?@='"));
  }

  @Test
  public void parseURIsWithFragmentsContainingPercentEscapes() {
    assertEquals(Uri.parse("#%23%23"), Uri.empty().fragmentIdentifier("##"));
    assertEquals(Uri.parse("#a%23b%23c"), Uri.empty().fragmentIdentifier("a#b#c"));
  }

  @Test
  public void parseURIsWithSchemesAndAuthorities() {
    assertEquals(Uri.parse("scheme://domain"), Uri.empty().schemeName("scheme").hostName("domain"));
    assertEquals(Uri.parse("scheme://domain:80"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80));
    assertEquals(Uri.parse("scheme://user@domain"), Uri.empty().schemeName("scheme").username("user").hostName("domain"));
    assertEquals(Uri.parse("scheme://user@domain:80"), Uri.empty().schemeName("scheme").username("user").hostName("domain").portNumber(80));
  }

  @Test
  public void parseURIsWithSchemesAndAbsolutePaths() {
    assertEquals(Uri.parse("scheme:/"), Uri.empty().schemeName("scheme").path("/"));
    assertEquals(Uri.parse("scheme:/one"), Uri.empty().schemeName("scheme").path("/", "one"));
    assertEquals(Uri.parse("scheme:/one/"), Uri.empty().schemeName("scheme").path("/", "one", "/"));
    assertEquals(Uri.parse("scheme:/one/two"), Uri.empty().schemeName("scheme").path("/", "one", "/", "two"));
    assertEquals(Uri.parse("scheme:/one/two/"), Uri.empty().schemeName("scheme").path("/", "one", "/", "two", "/"));
  }

  @Test
  public void parseURIsWithSchemesAndRelativePaths() {
    assertEquals(Uri.parse("scheme:one"), Uri.empty().schemeName("scheme").path("one"));
    assertEquals(Uri.parse("scheme:one/"), Uri.empty().schemeName("scheme").path("one", "/"));
    assertEquals(Uri.parse("scheme:one/two"), Uri.empty().schemeName("scheme").path("one", "/", "two"));
    assertEquals(Uri.parse("scheme:one/two/"), Uri.empty().schemeName("scheme").path("one", "/", "two", "/"));
  }

  @Test
  public void parseURIsWithSchemesAndQueries() {
    assertEquals(Uri.parse("scheme:?query"), Uri.empty().schemeName("scheme").query(null, "query"));
    assertEquals(Uri.parse("scheme:?key=value"), Uri.empty().schemeName("scheme").query("key", "value"));
  }

  @Test
  public void parseURIsWithSchemesAndFragments() {
    assertEquals(Uri.parse("scheme:#fragment"), Uri.empty().schemeName("scheme").fragmentIdentifier("fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndPaths() {
    assertEquals(Uri.parse("scheme://domain/path"), Uri.empty().schemeName("scheme").hostName("domain").path("/", "path"));
    assertEquals(Uri.parse("scheme://domain:80/path"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndQueries() {
    assertEquals(Uri.parse("scheme://domain?query"), Uri.empty().schemeName("scheme").hostName("domain").query(null, "query"));
    assertEquals(Uri.parse("scheme://domain:80?query"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).query(null, "query"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesAndFragments() {
    assertEquals(Uri.parse("scheme://domain#fragment"), Uri.empty().schemeName("scheme").hostName("domain").fragmentIdentifier("fragment"));
    assertEquals(Uri.parse("scheme://domain:80#fragment"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).fragmentIdentifier("fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndQueries() {
    assertEquals(Uri.parse("scheme://domain/path?query"), Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").query(null, "query"));
    assertEquals(Uri.parse("scheme://domain:80/path?query"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query(null, "query"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsAndFragments() {
    assertEquals(Uri.parse("scheme://domain/path#fragment"), Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").fragmentIdentifier("fragment"));
    assertEquals(Uri.parse("scheme://domain:80/path#fragment"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").fragmentIdentifier("fragment"));
  }

  @Test
  public void parseURIsWithSchemesAuthoritiesPathsQueriesAndFragments() {
    assertEquals(Uri.parse("scheme://domain/path?query#fragment"), Uri.empty().schemeName("scheme").hostName("domain").path("/", "path").query(null, "query").fragmentIdentifier("fragment"));
    assertEquals(Uri.parse("scheme://domain:80/path?query#fragment"), Uri.empty().schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query(null, "query").fragmentIdentifier("fragment"));
  }
}
