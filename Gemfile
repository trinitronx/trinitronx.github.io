source "https://rubygems.org"

if ENV["GITHUB_ACTIONS"] != "true"
  gem "dotenv"
  gem "github-pages"
  gem "jekyll"
  gem "jekyll-github-metadata"

# > Warning:  github-pages can't satisfy your Gemfile's dependencies.
# > To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
# https://github.com/TWiStErRob/twisterrob.github.io/commit/f0040c33b959c19e7bc834043b01d48715a91b38
# > Not sure what it does, because I don't use octokit directly:
# > https://github.com/octokit/octokit.rb/discussions/1486
# This was added as a workaround for https://github.com/actions/jekyll-build-pages/issues/104
  gem 'faraday-retry', '~> 2.2.0'
else

# Match dependency versions to:
# https://github.com/actions/jekyll-build-pages/blob/main/Gemfile
  gem "github-pages", "= 222"

# Explicitly include this gem here.
# It is not directly included in the github-pages gem list of dependencies,
# even though it is included in the original GitHub Pages build infrastructure.
  gem "jekyll-include-cache", "= 0.2.1"
end
