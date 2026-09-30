---
title: Detecting Popular Social Events through Limited Observation with Deep Survival Analysis
authors:
  - Maryam Ramezani
  - Hossein Goli
  - AmirMohammad Izadi
  - Hamid R. Rabiee
venue: arXiv preprint
venue_short: arXiv
year: 2024
date: 2024-10-02
type: preprint
arxiv: "2410.01320"
areas: [complex-networks]
tags: [Survival Analysis, Cascade Prediction, Popularity Prediction, Social Networks]
abstract: >-
  Identifying and analysing popular trends in social networks gives valuable insight into
  the dynamics of information dissemination. More importantly, by observing the
  dissemination pattern of a piece of information in the early stages of its expansion, it
  becomes possible to determine whether a cascade will become highly popular in the
  future. This research predicts and detects popular trends in social networks by
  observing limited early-stage data with a deep survival analysis based method. The
  proposed method is evaluated on real-world anonymised datasets from Twitter, Weibo and
  Digg, and is applicable to recommendation systems, reach prediction for digital content,
  and decision-making in digital marketing.
---

Predicting which cascade becomes popular is usually framed as classification over a fixed observation window. Survival analysis is a better fit: the quantity of interest is when — and whether — a cascade crosses a popularity threshold, and most observations are censored because the cascade is still running.

The model is trained on early-stage observations only, and evaluated on Twitter, Weibo and Digg.
