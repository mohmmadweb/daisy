---
title: DANI
kind: software
summary: Fast, diffusion-aware network inference that preserves the topological structure of the recovered graph. Linear time, with a MapReduce version for large graphs.
repo: https://github.com/AryanAhadinia/DANI
publication: dani-network-inference
areas: [complex-networks]
tags: [Network Inference, Information Diffusion]
order: 1
---

DANI recovers the edges of a social network from the cascades observed on it, combining a Markov transition matrix built from cascade timing with a structural similarity between nodes. Unlike link-only inference methods it keeps modular structure, degree distribution, density and clustering coefficients close to the true graph.

## Getting started

Clone the repository and follow its README to run DANI on your own cascade data or on the synthetic networks used in the paper.
