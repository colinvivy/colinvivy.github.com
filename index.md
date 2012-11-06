---
layout: default
globalTitle: colinvivy
title: home
keywords: colinvivy, github, front-end develop
pagesName: home
---
test content by github in TC
<div class="home_cont xxx">
    <div class="hc_post_list">

        {% for post in site.posts limit:5 %}
        <div class="hc_post_list_item">
            <p>{{ post.date | date_to_string }}</p>
            <div class="hc_post_list_item_hd">
                <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
                <a class="comments" href="{{ post.url }}#disqus_thread">View Comments</a>
            </div>

            <p class="excerpt">{{ post.excerpt }}</p>
        </div>
        {% endfor %}

    </div>

    <div class="hc_past">
        <a href="javascript:void(0)">Older Posts &raquo;</a>
    </div>
</div>
