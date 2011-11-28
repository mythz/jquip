var __p = [], print = function(){
	__p.push.apply(__p, arguments);
};
with (obj || {}){
	__p.push('\n\n  <tr class="', IsTrivial ? trivial : '', '" data-timing-id="', Id, '">\n  <td class="label" title="', Name && Name.length > 45 ? Name : '', '">\n      ' +
		'<span class="indent">', MiniProfiler.renderIndent(Depth), '</span> ', Name.slice(0, 45), '', Name && Name.length > 45 ? '...' : '', '\n    </td>\n    <td class="duration" title="duration of this step without any children\'s durations">\n\t  ', MiniProfiler.formatDuration(DurationWithoutChildrenMilliseconds), '\n\t</td>\n    <td class="duration duration-with-children" title="duration of this step and its children">\n\t  ', MiniProfiler.formatDuration(DurationMilliseconds), '\n\t</td>\n    <td class="duration time-from-start" title="time elapsed since profiling started">\n      <span class="unit">+</span>', MiniProfiler.formatDuration(StartMilliseconds), '\n    </td>\n\n\t');
	if (HasSqlTimings){
		;
		__p.push('\n\t  <td class="duration ', HasDuplicateSqlTimings ? 'warning' : '', '" title="', HasDuplicateSqlTimings ? 'duplicate queries detected - ' : '', '', ExecutedReaders, ' reader, ', ExecutedScalars, ' scalar, ', ExecutedNonQueries, ' non-query statements executed">\n\t  <a class="queries-show">\n        ');
		if (HasDuplicateSqlTimings){
			;
			__p.push('<span class="nuclear">!</span>');
		}
		;
		__p.push('\n        ', SqlTimings.length, '<span class="unit">sql</span>\n      </a>\n    </td>\n    <td class="duration" title="aggregate duration of all queries in this step (excludes children)">\n\t  ', MiniProfiler.formatDuration(SqlTimingsDurationMilliseconds), '\n    </td>\n    ');
	}
	;
	__p.push('\n\n  </tr>\n\n  ');
	if (HasChildren){
		;
		__p.push('\n\t');
		$._each(Children, function($value){
			;
			__p.push('\n\t  ', $.tmpl("#timingTemplate", $value), '\n\t');
		};
		__p.push('\n  ');
	}
	;
	__p.push('\n\n');
}
return __p.join('');