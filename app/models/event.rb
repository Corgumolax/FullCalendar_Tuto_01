class Event < ActiveRecord::Base
  attr_accessible :allDay, :editable, :end, :start, :title

  #scope :between, lambda { |start_time, end_time|
  #  {:conditions => ["start > ? and start < ?", Event.format_date(start_time), Event.format_date(end_time)]}
  #}
  scope :between, lambda { |start_time, end_time|
    st = Event.format_date(start_time)
    et = Event.format_date(end_time)
    {:conditions => ["start > ? and start < ? or end < ? and end > ? or start < ? and end > ?", st, et, et, st,st,et]}
  }

  def self.format_date(date_time)
    Time.at(date_time.to_i).to_formatted_s(:db)
  end

  def as_json(options = {})
    {
        :id => self.id,
        :title => self.title,
        :start => self.start.rfc822,
        :end => self.end.rfc822,
        :allDay => self.allDay,
        :editable => self.editable
    }
  end

end
