---
layout: default
globalTitle: colinvivy
title: home
keywords: colinvivy, github, front-end develop
pagesName: home
---
<div class="home_cont yyy">
    <div class="hc_post_list">

        {% for post in site.posts limit:20 %}
        <div class="hc_post_list_item">
            <p>{{ post.date | date_to_string }}</p>
            <div class="hc_post_list_item_hd">
                <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
                <a class="comments hidden" href="{{ post.url }}#disqus_thread">View Comments</a>
            </div>

            <p class="excerpt">{{ post.excerpt }}</p>
        </div>
        {% endfor %}

    </div>

    <div class="hc_past">
        <a href="past.html">Older Posts &raquo;</a>
    </div>
</div>

