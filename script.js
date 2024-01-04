var yourNameSpace = window.yourNameSpace || {};
yourNameSpace.fashion = yourNameSpace.fashion || {};
yourNameSpace.fashion.awsHeaderSearch =
    yourNameSpace.fashion.awsHeaderSearch ||
    (function ($, window, document) {
        const self = {};
        const searchTermKey = "query_text";
        const parentComponent = ".federated-search"
        const resultSection = ".federated-search-result";
        const pageNoKey = "pageno"

        self.init = function () {
            $(document).ready(this.documentReady);
            $(parentComponent).find('.search-submit:not(:disabled)').click(function (e) {
                e.preventDefault();
                const uri = window.location.href;
                const uriWithTerm = self.updateQueryStringParameter(uri, searchTermKey, $(parentComponent).find('.search-field').val());
                const finalURL = self.updateQueryStringParameter(uriWithTerm, pageNoKey, 1);
                window.location.assign(finalURL);
            });

        };

        self.getQueryString = function (key, uri = window.location.search) {
            const urlParams = new URLSearchParams(uri);
            return urlParams.get(key);
        }

        self.updateQueryStringParameter = function (uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            }
            else {
                return uri + separator + key + "=" + value;
            }
        }

        self.onPaginationClick = function (pageParam) {
            const finalURL = self.updateQueryStringParameter(window.location.href, pageNoKey, pageParam);
            window.location.assign(finalURL);
        }

        self.validation = function () {
            $(parentComponent).find(".header-search-error-msg").hide();
            $(parentComponent).find(".search-field").each(function () {
                $(this).on('input', function (evt) {
                    let value = evt.target.value;
                    const regexPattern = /^[\p{L}\p{N}\p{M}\p{Zs}]{1,15}$/ugm;
                    const headerSearchElement = $(this).parents('.header-search-element');
                    if (value != "" && value != undefined) {
                        const result = regexPattern.test(value);
                        if (!result) {
                            headerSearchElement.find(".header-search-error-msg").show();
                            headerSearchElement.find(".search-submit").prop("disabled", "disabled");
                        } else {
                            headerSearchElement.find(".header-search-error-msg").hide();
                            headerSearchElement.find(".search-submit").prop("disabled", false);
                        }
                    } else {
                        headerSearchElement.find(".header-search-error-msg").hide();
                        headerSearchElement.find(".search-submit").prop("disabled", false);
                    }
                })
            })
        }

        self.generateResult = function (response) {
            response.text().then(function (responseText) {
                var respData = JSON.parse(responseText);
                var dom = `<div class="result-search"> 
                            <span class="search-stats"> Total: <b>${respData.TotalNumberOfResults}</b> Results Found </span>
                            <ul class="results">
                                ${respData.ResultItems.map(item => `<li><a href="${item.DocumentURI}" target="simple--docs-page">${item.Title}</a><p>${item.AnswerText}</p></li>`).join("")}
                            </ul>
                        </div> `;
                $(resultSection).html(dom);
            });
        }

        self.generatePagination = function (response) {
            if (window.yourNameSpace.paging) {
                const paginationElement = document.getElementById('pagination');
                const params = {
                    size: response.PageSize, // pages size
                    page: parseInt(self.getQueryString(pageNoKey)) || 1,  // selected page
                    step: 3   // pages before and after current
                }
                window.yourNameSpace.paging.init(paginationElement, params, self.onPaginationClick);
            }
        }

        self.getResults = function (searchTerm = '') {
            const url = $(parentComponent).attr('data-api') + '.search.json' + `?${searchTermKey}=${searchTerm}`
            fetch(url)
                .then(function (response) {
                    self.generateResult(response);
                    self.generatePagination(response);
                })
        }

        self.documentReady = function () {
            self.validation();
            const searchTerm = self.getQueryString(searchTermKey);
            if (searchTerm && searchTerm.length) {
                self.getResults(searchTerm);
                $(parentComponent).find('.search-field').val(searchTerm);
            }
        };

        return self;
    })($, window, document);

window.yourNameSpace = window.yourNameSpace || yourNameSpace;
window.yourNameSpace.fashion.awsHeaderSearch.init();
