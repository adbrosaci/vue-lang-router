<template>
	<div>
		<h1>{{ $t('pos.manager') }}</h1>
		<p>ID: {{ $route.params.id }}</p>
		<br />
		<p>Manager: {{ $route.params.name }}</p>
	</div>
</template>
