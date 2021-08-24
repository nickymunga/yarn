# Midgard-yarn

midgard-yarn is a fork of yarn which resulted from yarn refusing contributions.

midgard-yarn has the following improvements over yarn:

- *[reliability]* retry on more errors.
- *[performance]* detect abnormally long requests and when detected create racing requests.
- *[performance]* use workers to copy files from cache to node_modules.
- *[performance]* optimize cycle-detection algorithm from o(n2) to o(n.log(n)).
- *[feature]* add support for --frozen-lockfile in monorepos.


## Contributions

Contributions are welcome. To get your PR reviewed, merged and published you can contact any of the following people:
- VincentBailly
- markjm
- bweggersen
- JasonGore
