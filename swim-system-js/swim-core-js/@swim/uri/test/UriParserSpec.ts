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

import {Spec, Test, Exam} from "@swim/unit";
import {Uri} from "@swim/uri";

export class UriParserSpec extends Spec {
  @Test
  parseEmptyURIs(exam: Exam): void {
    exam.equal(Uri.parse(""), Uri.empty());
  }

  @Test
  parseURIsWithSchemes(exam: Exam): void {
    exam.equal(Uri.parse("scheme:"), Uri.schemeName("scheme"));
    exam.equal(Uri.parse("AZaz09+-.:"), Uri.schemeName("azaz09+-."));
  }

  @Test
  parseURIsWithEmptyAuthorities(exam: Exam): void {
    exam.equal(Uri.parse("//"), Uri.hostName(""));
  }

  @Test
  parseURIsWithHostNames(exam: Exam): void {
    exam.equal(Uri.parse("//domain"), Uri.hostName("domain"));
  }

  @Test
  parseURIsWithHostNamesContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("//%2f%2f"), Uri.hostName("//"));
    exam.equal(Uri.parse("//a%2fb%2fc"), Uri.hostName("a/b/c"));
  }

  @Test
  parseURIsWithIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//127.0.0.1"), Uri.hostIPv4("127.0.0.1"));
    exam.equal(Uri.parse("//255.255.255.255"), Uri.hostIPv4("255.255.255.255"));
  }

  @Test
  parseURIsWithIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//[::1]"), Uri.hostIPv6("::1"));
  }

  @Test
  parseURIsWithHostNamesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//domain:80"), Uri.hostName("domain").portNumber(80));
  }

  @Test
  parseURIsWithIPv4AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//127.0.0.1:80"), Uri.hostIPv4("127.0.0.1").portNumber(80));
  }

  @Test
  parseURIsWithIPv6AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//[::1]:80"), Uri.hostIPv6("::1").portNumber(80));
  }

  @Test
  parseURIsWithPortsButNotHost(exam: Exam): void {
    exam.equal(Uri.parse("//:80"), Uri.hostName("").portNumber(80));
  }

  @Test
  parseURIsWithEmptyPorts(exam: Exam): void {
    exam.equal(Uri.parse("//:"), Uri.hostName("").portNumber(0));
  }

  @Test
  parseURIsWithEmptyUsers(exam: Exam): void {
    exam.equal(Uri.parse("//@"), Uri.username("").hostName(""));
  }

  @Test
  parseURIsWithEmptyUsersAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//@:"), Uri.username("").hostName("").portNumber(0));
  }

  @Test
  parseURIsWithUsersButNotHosts(exam: Exam): void {
    exam.equal(Uri.parse("//user@"), Uri.username("user").hostName(""));
  }

  @Test
  parseURIsWithUsernamesAndPasswordsButNotHosts(exam: Exam): void {
    exam.equal(Uri.parse("//user:pass@"), Uri.username("user", "pass").hostName(""));
  }

  @Test
  parseURIsWithUsersContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("//%2f%3a@"), Uri.username("/:").hostName(""));
    exam.equal(Uri.parse("//a%2fb%3ac@"), Uri.username("a/b:c").hostName(""));
  }

  @Test
  parseURIsWithUsernamesAndPasswordsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("//%2f%3a:%3a%2f@"), Uri.username("/:", ":/").hostName(""));
    exam.equal(Uri.parse("//a%2fb%3ac:d%3ae%2ff@"), Uri.username("a/b:c", "d:e/f").hostName(""));
  }

  @Test
  parseURIsWithUsersAndHostNames(exam: Exam): void {
    exam.equal(Uri.parse("//user@domain"), Uri.username("user").hostName("domain"));
  }

  @Test
  parseURIsWithUsernamesAndPasswordsAndHostNames(exam: Exam): void {
    exam.equal(Uri.parse("//user:pass@domain"), Uri.username("user", "pass").hostName("domain"));
  }

  @Test
  parseURIsWithUsesAndIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//user@127.0.0.1"), Uri.username("user").hostIPv4("127.0.0.1"));
  }

  @Test
  parseURIsWithUsernamesAndPasswordsndIPv4Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//user:pass@127.0.0.1"), Uri.username("user", "pass").hostIPv4("127.0.0.1"));
  }

  @Test
  parseURIsWithUsersAndIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//user@[::1]"), Uri.username("user").hostIPv6("::1"));
  }

  @Test
  parseURIsWithUsernamesAndPasswordsAndIPv6Addresses(exam: Exam): void {
    exam.equal(Uri.parse("//user:pass@[::1]"), Uri.username("user", "pass").hostIPv6("::1"));
  }

  @Test
  parseURIsWithUsersAndHostNamesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//user@domain:80"), Uri.username("user").hostName("domain").portNumber(80));
  }

  @Test
  parseURIsWithUsesAndIPv4AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//user@127.0.0.1:80"), Uri.username("user").hostIPv4("127.0.0.1").portNumber(80));
  }

  @Test
  parseURIsWithUsersAndIPv6AddressesAndPorts(exam: Exam): void {
    exam.equal(Uri.parse("//user@[::1]:80"), Uri.username("user").hostIPv6("::1").portNumber(80));
  }

  @Test
  parseURIsWithAbsolutePaths(exam: Exam): void {
    exam.equal(Uri.parse("/"), Uri.path("/"));
    exam.equal(Uri.parse("/one"), Uri.path("/", "one"));
    exam.equal(Uri.parse("/one/"), Uri.path("/", "one", "/"));
    exam.equal(Uri.parse("/one/two"), Uri.path("/", "one", "/", "two"));
    exam.equal(Uri.parse("/one/two/"), Uri.path("/", "one", "/", "two", "/"));
  }

  @Test
  parseURIsWithRelativePaths(exam: Exam): void {
    exam.equal(Uri.parse("one"), Uri.path("one"));
    exam.equal(Uri.parse("one/"), Uri.path("one", "/"));
    exam.equal(Uri.parse("one/two"), Uri.path("one", "/", "two"));
    exam.equal(Uri.parse("one/two/"), Uri.path("one", "/", "two", "/"));
  }

  @Test
  parseURIsWithPathsContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.parse("/one/!$&()*+,;='/three"), Uri.path("/", "one", "/", "!$&()*+,;=\'", "/", "three"));
  }

  @Test
  parseURIsWithPathsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("/%3a%2f%3a"), Uri.path("/", ":/:"));
    exam.equal(Uri.parse("/a%3ab%2fc%3ad"), Uri.path("/", "a:b/c:d"));
    exam.equal(Uri.parse("%20"), Uri.path(" "));
  }

  @Test
  parseURIsWithEmptyQueries(exam: Exam): void {
    exam.equal(Uri.parse("?"), Uri.query({$0: ""}));
  }

  @Test
  parseURIsWithQueryParts(exam: Exam): void {
    exam.equal(Uri.parse("?query"), Uri.query({$0: "query"}));
  }

  @Test
  parseURIsWithQueryParams(exam: Exam): void {
    exam.equal(Uri.parse("?key=value"), Uri.query({key: "value"}));
    exam.equal(Uri.parse("?k1=v1&k2=v2"), Uri.query({k1: "v1", k2: "v2"}));
    exam.equal(Uri.parse("?k1=v=1"), Uri.query({k1: "v=1"}));
    exam.equal(Uri.parse("?k1="), Uri.query({k1: ""}));
    exam.equal(Uri.parse("?=v1"), Uri.query({"": "v1"}));
    exam.equal(Uri.parse("?="), Uri.query({"": ""}));
    exam.equal(Uri.parse("?a&b"), Uri.query({$0: "a", $1: "b"}));
    exam.equal(Uri.parse("?a&a=b&b"), Uri.query({$0: "a", a: "b", $2: "b"}));
    exam.equal(Uri.parse("?&"), Uri.query({$0: "", $1: ""}));
  }

  @Test
  parseURIsWithQueriesContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.parse("?!$()*+,/:;?@'"), Uri.query({$0: "!$()*+,/:;?@'"}));
  }

  @Test
  parseURIsWithQueryPartsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("?%3f%3f"), Uri.query({$0: "??"}));
    exam.equal(Uri.parse("?a%3fb%3fc"), Uri.query({$0: "a?b?c"}));
  }

  @Test
  parseURIsWithEmptyFragments(exam: Exam): void {
    exam.equal(Uri.parse("#"), Uri.fragmentIdentifier(""));
  }

  @Test
  parseURIsWithFragmentIdentifiers(exam: Exam): void {
    exam.equal(Uri.parse("#fragment"), Uri.fragmentIdentifier("fragment"));
  }

  @Test
  parseURIsWithFragmentsContainingPermittedDelimeters(exam: Exam): void {
    exam.equal(Uri.parse("#!$&()*+,/:;?@='"), Uri.fragmentIdentifier("!$&()*+,/:;?@='"));
  }

  @Test
  parseURIsWithFragmentsContainingPercentEscapes(exam: Exam): void {
    exam.equal(Uri.parse("#%23%23"), Uri.fragmentIdentifier("##"));
    exam.equal(Uri.parse("#a%23b%23c"), Uri.fragmentIdentifier("a#b#c"));
  }

  @Test
  parseURIsWithSchemesAndAuthorities(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain"), Uri.schemeName("scheme").hostName("domain"));
    exam.equal(Uri.parse("scheme://domain:80"), Uri.schemeName("scheme").hostName("domain").portNumber(80));
    exam.equal(Uri.parse("scheme://user@domain"), Uri.schemeName("scheme").username("user").hostName("domain"));
    exam.equal(Uri.parse("scheme://user@domain:80"), Uri.schemeName("scheme").username("user").hostName("domain").portNumber(80));
  }

  @Test
  parseURIsWithSchemesAndAbsolutePaths(exam: Exam): void {
    exam.equal(Uri.parse("scheme:/"), Uri.schemeName("scheme").path("/"));
    exam.equal(Uri.parse("scheme:/one"), Uri.schemeName("scheme").path("/", "one"));
    exam.equal(Uri.parse("scheme:/one/"), Uri.schemeName("scheme").path("/", "one", "/"));
    exam.equal(Uri.parse("scheme:/one/two"), Uri.schemeName("scheme").path("/", "one", "/", "two"));
    exam.equal(Uri.parse("scheme:/one/two/"), Uri.schemeName("scheme").path("/", "one", "/", "two", "/"));
  }

  @Test
  parseURIsWithSchemesAndRelativePaths(exam: Exam): void {
    exam.equal(Uri.parse("scheme:one"), Uri.schemeName("scheme").path("one"));
    exam.equal(Uri.parse("scheme:one/"), Uri.schemeName("scheme").path("one", "/"));
    exam.equal(Uri.parse("scheme:one/two"), Uri.schemeName("scheme").path("one", "/", "two"));
    exam.equal(Uri.parse("scheme:one/two/"), Uri.schemeName("scheme").path("one", "/", "two", "/"));
  }

  @Test
  parseURIsWithSchemesAndQueries(exam: Exam): void {
    exam.equal(Uri.parse("scheme:?query"), Uri.schemeName("scheme").query({$0: "query"}));
    exam.equal(Uri.parse("scheme:?key=value"), Uri.schemeName("scheme").query({key: "value"}));
  }

  @Test
  parseURIsWithSchemesAndFragments(exam: Exam): void {
    exam.equal(Uri.parse("scheme:#fragment"), Uri.schemeName("scheme").fragmentIdentifier("fragment"));
  }

  @Test
  parseURIsWithSchemesAuthoritiesAndPaths(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain/path"), Uri.schemeName("scheme").hostName("domain").path("/", "path"));
    exam.equal(Uri.parse("scheme://domain:80/path"), Uri.schemeName("scheme").hostName("domain").portNumber(80).path("/", "path"));
  }

  @Test
  parseURIsWithSchemesAuthoritiesAndQueries(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain?query"), Uri.schemeName("scheme").hostName("domain").query({$0: "query"}));
    exam.equal(Uri.parse("scheme://domain:80?query"), Uri.schemeName("scheme").hostName("domain").portNumber(80).query({$0: "query"}));
  }

  @Test
  parseURIsWithSchemesAuthoritiesAndFragments(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain#fragment"), Uri.schemeName("scheme").hostName("domain").fragmentIdentifier("fragment"));
    exam.equal(Uri.parse("scheme://domain:80#fragment"), Uri.schemeName("scheme").hostName("domain").portNumber(80).fragmentIdentifier("fragment"));
  }

  @Test
  parseURIsWithSchemesAuthoritiesPathsAndQueries(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain/path?query"), Uri.schemeName("scheme").hostName("domain").path("/", "path").query({$0: "query"}));
    exam.equal(Uri.parse("scheme://domain:80/path?query"), Uri.schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query({$0: "query"}));
  }

  @Test
  parseURIsWithSchemesAuthoritiesPathsAndFragments(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain/path#fragment"), Uri.schemeName("scheme").hostName("domain").path("/", "path").fragmentIdentifier("fragment"));
    exam.equal(Uri.parse("scheme://domain:80/path#fragment"), Uri.schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").fragmentIdentifier("fragment"));
  }

  @Test
  parseURIsWithSchemesAuthoritiesPathsQueriesAndFragments(exam: Exam): void {
    exam.equal(Uri.parse("scheme://domain/path?query#fragment"), Uri.schemeName("scheme").hostName("domain").path("/", "path").query({$0: "query"}).fragmentIdentifier("fragment"));
    exam.equal(Uri.parse("scheme://domain:80/path?query#fragment"), Uri.schemeName("scheme").hostName("domain").portNumber(80).path("/", "path").query({$0: "query"}).fragmentIdentifier("fragment"));
  }
}
