import { Module } from "@nestjs/common";
import { TimeZoneService } from "./time-zone.service";

@Module({
    providers: [TimeZoneService],
})
export class TimeZoneModule {}
