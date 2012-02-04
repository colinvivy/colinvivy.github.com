{% for post in category_posts %}
<div class="cate_item">
<a class="title" href="{{ post.url }}">{{ post.title }}</a>
&nbsp&nbsp	{{ post.date | date_to_string }}
</div>
{% endfor %}
